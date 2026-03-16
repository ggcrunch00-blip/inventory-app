import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import ItemCard from '../../components/common/ItemCard';
import InventoryGrid from '../../components/common/InventoryGrid';
import EmptyState from '../../components/common/EmptyState';
import AppImage from '../../components/common/AppImage';
import {
  calculatePlanSummary,
  createId,
  getItemAcquisitionMode,
  getItemCost,
  normalizeCustomName,
} from '../../utils/inventory';
import {
  getItemAcquisitionType,
  getItemRewardGroup,
  getSessionRewardGroup,
  isCharacterAllowedForItem,
  isItemAvailableForSession,
} from '../../data/lessonItemSeeds';

const PET_NAME_LIMIT = 10;

const TEXT = {
  noSessionTitle: '아이템 얻기',
  noSessionDescription: '현재 선택된 차시가 없어요.',
  noSessionEmptyTitle: '현재 차시가 없어요',
  noSessionEmptyDescription: '선생님이 현재 차시를 선택하면 여기에서 아이템을 받을 수 있어요.',
  currentSession: '현재 차시',
  title: '오늘 점수로 아이템 얻기',
  description: '남은 점수는 보상 시간이 끝나면 사라져요. 필요한 아이템만 골라 주세요.',
  shopClosedTitle: '이번 차시는 상점이 닫혀 있어요',
  shopClosedDescription: '오늘은 아이템을 얻는 차시가 아니에요.',
  step1Title: '1. 오늘 점수 입력',
  step1Description: '수업에서 받은 점수를 그대로 입력해 주세요.',
  scorePlaceholder: '예: 50',
  confirmScore: '점수 확인',
  resetScore: '다시 입력',
  step2Title: '2. 받을 수 있는 아이템',
  step2Description: '현재 차시에 연결된 아이템만 보여 줍니다.',
  needScoreTitle: '먼저 오늘 점수를 확인해 주세요',
  needScoreDescription: '점수를 입력해야 받을 수 있는 아이템이 보여요.',
  emptyLessonItemsTitle: '이번 차시에는 아직 준비된 아이템이 없어요.',
  emptyLessonItemsDescription: '선생님이 아이템을 연결하면 여기에서 볼 수 있어요.',
  notEnoughScore: '점수 부족',
  step3Title: '3. 남은 점수와 계획',
  step3Description: '확정 전까지는 미리보기 상태라 실제 인벤토리는 바뀌지 않아요.',
  enteredScore: '입력 점수',
  spentScore: '사용 점수',
  remainingScore: '남은 점수',
  discardItem: '버릴 아이템',
  incomingItem: '새로 얻을 아이템',
  chooseFromInventory: '현재 인벤토리에서 선택해 주세요',
  none: '없음',
  discardNone: '버릴 아이템 없음',
  discardPrefix: '버릴 아이템:',
  bonusItem: '보너스 아이템',
  scoreSuffix: '점 사용',
  removePlan: '제거',
  noPlannedItemsTitle: '아직 고른 아이템이 없어요',
  noPlannedItemsDescription: '점수를 확인한 뒤 받고 싶은 아이템을 골라 주세요.',
  confirmReward: '보상 확정하고 종료하기',
  inventoryTitle: '현재 인벤토리',
  inventoryDescription: '12칸이 모두 차면 새 아이템을 고른 뒤 여기에서 버릴 아이템을 선택하게 됩니다.',
  inventoryDescriptionWithPending: '을(를) 받으려면 여기에서 버릴 아이템을 바로 눌러 주세요.',
  discardAction: '이 아이템 버리기',
  pendingHelper: '빨간 표시가 버릴 대상으로 예약된 아이템입니다. 마지막 확인 전까지는 실제로 삭제되지 않아요.',
  cancelPending: '새 아이템 선택 취소',
  petTitle: '5차시 펫 선택',
  petDescription: '마음에 드는 펫 1마리를 선택하세요.',
  petEmptyTitle: '선택할 수 있는 펫이 없어요',
  petEmptyDescription: '선생님이 5차시 펫을 준비하면 여기에서 볼 수 있어요.',
  petBadge: '펫',
  petAction: '이 펫 선택하기',
  petNameTitle: '이름 짓기',
  petNameDescription: '펫 이름을 입력하고 저장하면 인벤토리에 추가돼요.',
  petNameLabel: '펫 이름',
  petNamePlaceholder: '예: 집게왕',
  petNameHint: '이름은 10자 이내로 입력해 주세요.',
  petNameError: '이름을 입력해야 펫을 저장할 수 있어요.',
  petSave: '이 이름으로 저장하기',
  petCancel: '다른 펫 고르기',
  petSelectedTitle: '이미 5차시 펫을 선택했어요',
  petSelectedDescription: '한 학생당 5차시 펫은 1마리만 가질 수 있어요.',
  petFullTitle: '인벤토리가 가득 차 있어요',
  petFullDescription: '인벤토리가 가득 차서 펫을 추가할 수 없어요.',
  petCurrentName: '내 펫 이름',
  petCurrentSpecies: '선택한 펫',
  petInventoryDescription: '펫도 인벤토리 1칸을 차지해요. 빈 칸이 있어야 선택할 수 있어요.',
  petDiscardDescription: '새 펫을 얻으려면 버릴 아이템 1개를 선택해 주세요.',
  selected: '선택 완료',
  petLabelFallback: '펫',
  specialTitle: '6차시 스페셜 에디션: 카메라 선택',
  specialDescription: '마음에 드는 카메라 1개를 선택하세요.',
  specialEmptyTitle: '선택할 수 있는 카메라가 없어요',
  specialEmptyDescription: '선생님이 6차시 카메라를 준비하면 여기에서 볼 수 있어요.',
  specialBadge: '스페셜',
  specialAction: '이 카메라 선택하기',
  specialSelectedTitle: '이미 6차시 카메라를 선택했어요',
  specialSelectedDescription: '한 학생당 6차시 카메라는 1개만 선택할 수 있어요.',
  specialCurrentItem: '선택한 카메라',
  specialFullTitle: '인벤토리가 가득 차 있어요',
  specialFullDescription: '인벤토리가 가득 차서 카메라를 추가할 수 없어요.',
  specialInventoryDescription: '카메라도 인벤토리 1칸을 차지해요. 빈 칸이 있어야 선택할 수 있어요.',
  specialDiscardDescription: '새 카메라를 얻으려면 버릴 아이템 1개를 선택해 주세요.',
  specialConfirm: '이 카메라 받기',
  specialCancel: '다른 카메라 고르기',
  missionTitle: '10~11차시 미션 성공 보상 선택',
  missionDescription: '받고 싶은 보상을 여러 개 선택할 수 있어요.',
  missionEmptyTitle: '선택할 수 있는 미션 보상이 없어요',
  missionEmptyDescription: '선생님이 10~11차시 보상을 준비하면 여기에서 볼 수 있어요.',
  missionBadge: '미션 보상',
  missionAction: '선택 목록에 담기',
  missionSelectedAction: '선택 취소',
  missionCurrentTitle: '이미 받은 미션 보상',
  missionCurrentDescription: '이미 받은 보상은 다시 선택하지 않아요.',
  missionSelectionTitle: '선택한 보상',
  missionSelectionDescription: '확인을 누르면 선택한 보상이 인벤토리에 추가돼요.',
  missionConfirm: '선택한 보상 받기',
  missionFullTitle: '인벤토리 빈 칸이 부족해요',
  missionFullDescription: '남은 칸 수만큼만 보상을 선택할 수 있어요.',
  missionInventoryDescription: '미션 성공 보상도 각각 인벤토리 1칸을 차지해요.',
  missionRemainingSlots: '남은 빈 칸',
  missionSelectedCount: '선택한 보상 수',
  missionDiscardPrefix: '보상을 받으려면 버릴 아이템 수',
  discardSelectHelper: '버릴 아이템 선택',
};

function findCurrentLessonPet(inventory = [], lessonNumber) {
  return (inventory || []).find((entry) => entry.type === 'pet' && Number(entry.lesson) === Number(lessonNumber)) || null;
}

function findCurrentLessonSpecial(inventory = [], lessonNumber) {
  return (inventory || []).find(
    (entry) => entry.type === 'special_select' && Number(entry.lesson) === Number(lessonNumber),
  ) || null;
}

function findCurrentMissionItems(inventory = [], rewardGroup) {
  return (inventory || []).filter(
    (entry) => entry.type === 'mission_select' && entry.rewardGroup === rewardGroup,
  );
}

export default function RewardPage() {
  const { currentStudent, activeSession, items, actions } = useAppContext();
  const navigate = useNavigate();
  const [scoreInput, setScoreInput] = useState('');
  const [confirmedScore, setConfirmedScore] = useState(null);
  const [plan, setPlan] = useState([]);
  const [pendingSelection, setPendingSelection] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [petNameInput, setPetNameInput] = useState('');
  const [petError, setPetError] = useState('');
  const [petReplaceEntryId, setPetReplaceEntryId] = useState('');
  const [selectedSpecialId, setSelectedSpecialId] = useState('');
  const [specialReplaceEntryId, setSpecialReplaceEntryId] = useState('');
  const [selectedMissionItemIds, setSelectedMissionItemIds] = useState([]);
  const [missionReplaceEntryIds, setMissionReplaceEntryIds] = useState([]);

  if (!currentStudent) {
    return <Navigate to="/login" replace />;
  }

  if (!currentStudent.selectedCharacter) {
    return <Navigate to="/student/characters" replace />;
  }

  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const activeRewardGroup = getSessionRewardGroup(activeSession);
  const purchaseItems = (activeSession?.purchaseItems || [])
    .map((itemId) => itemsById[itemId])
    .filter(Boolean)
    .filter(
      (item) =>
        getItemAcquisitionType(item) === 'select' &&
        (!activeRewardGroup || getItemRewardGroup(item) === activeRewardGroup) &&
        isItemAvailableForSession(item, activeSession) &&
        isCharacterAllowedForItem(item, currentStudent.selectedCharacter),
    );
  const petOptionsSource =
    activeSession?.petItems?.length
      ? activeSession.petItems.map((itemId) => itemsById[itemId]).filter(Boolean)
      : items.filter(
          (item) =>
            getItemAcquisitionType(item) === 'pet_select' &&
            (!activeRewardGroup || getItemRewardGroup(item) === activeRewardGroup) &&
            isItemAvailableForSession(item, activeSession) &&
            isCharacterAllowedForItem(item, currentStudent.selectedCharacter),
        );
  const petOptions = petOptionsSource.filter((item) => getItemAcquisitionType(item) === 'pet_select');
  const specialOptionsSource =
    activeSession?.specialItems?.length
      ? activeSession.specialItems.map((itemId) => itemsById[itemId]).filter(Boolean)
      : items.filter(
          (item) =>
            getItemAcquisitionType(item) === 'special_select' &&
            (!activeRewardGroup || getItemRewardGroup(item) === activeRewardGroup) &&
            isItemAvailableForSession(item, activeSession) &&
            isCharacterAllowedForItem(item, currentStudent.selectedCharacter),
        );
  const specialOptions = specialOptionsSource.filter((item) => getItemAcquisitionType(item) === 'special_select');
  const missionOptionsSource =
    activeSession?.missionItems?.length
      ? activeSession.missionItems.map((itemId) => itemsById[itemId]).filter(Boolean)
      : items.filter(
          (item) =>
            getItemAcquisitionType(item) === 'mission_select' &&
            (!activeRewardGroup || getItemRewardGroup(item) === activeRewardGroup) &&
            isItemAvailableForSession(item, activeSession) &&
            isCharacterAllowedForItem(item, currentStudent.selectedCharacter),
        );
  const missionOptions = missionOptionsSource.filter((item) => getItemAcquisitionType(item) === 'mission_select');
  const lessonNumber = Number(activeSession?.lessons?.[0] || activeSession?.lesson || 0);
  const isPetSession = lessonNumber === 5 && petOptions.length > 0;
  const isSpecialSession = lessonNumber === 6 && specialOptions.length > 0;
  const isMissionSession = activeRewardGroup === 'lesson10_11' && missionOptions.length > 0;
  const currentLessonPet = findCurrentLessonPet(currentStudent.inventory || [], 5);
  const currentLessonSpecial = findCurrentLessonSpecial(currentStudent.inventory || [], 6);
  const currentMissionItems = findCurrentMissionItems(currentStudent.inventory || [], activeRewardGroup);
  const currentMissionItemIds = new Set(currentMissionItems.map((entry) => entry.itemId));
  const availableMissionOptions = missionOptions.filter((item) => !currentMissionItemIds.has(item.id));
  const selectedMissionItems = availableMissionOptions.filter((item) => selectedMissionItemIds.includes(item.id));
  const selectedPet = petOptions.find((item) => item.id === selectedPetId) || null;
  const selectedSpecialItem = specialOptions.find((item) => item.id === selectedSpecialId) || null;
  const isInventoryFull = (currentStudent.inventory || []).length >= 12;
  const remainingInventorySlots = Math.max(12 - (currentStudent.inventory || []).length, 0);
  const petNeedsDiscard = Boolean(selectedPet) && !currentLessonPet && isInventoryFull;
  const specialNeedsDiscard = Boolean(selectedSpecialItem) && !currentLessonSpecial && isInventoryFull;
  const missionDiscardNeededCount = Math.max(selectedMissionItemIds.length - remainingInventorySlots, 0);

  useEffect(() => {
    if (missionReplaceEntryIds.length > missionDiscardNeededCount) {
      setMissionReplaceEntryIds((current) => current.slice(0, missionDiscardNeededCount));
    }
  }, [missionDiscardNeededCount, missionReplaceEntryIds.length]);

  const summary = calculatePlanSummary(currentStudent.inventory || [], plan, itemsById);
  const remainingScore = confirmedScore === null ? 0 : Math.max(confirmedScore - summary.spentScore, 0);
  const reservedDiscardEntryIds = plan.map((step) => step.replaceEntryId).filter(Boolean);
  const lastPlannedStep = plan[plan.length - 1] || null;
  const summaryDiscardEntryId = pendingSelection?.replaceEntryId || lastPlannedStep?.replaceEntryId || '';
  const summaryDiscardItem = summaryDiscardEntryId
    ? itemsById[currentStudent.inventory.find((entry) => entry.id === summaryDiscardEntryId)?.itemId]
    : null;
  const summaryIncomingItem = pendingSelection
    ? itemsById[pendingSelection.itemId]
    : lastPlannedStep
      ? itemsById[lastPlannedStep.itemId]
      : null;

  function resetPlan() {
    setPlan([]);
    setPendingSelection(null);
  }

  function confirmScore() {
    const parsed = Number(scoreInput);

    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }

    setConfirmedScore(parsed);
    resetPlan();
  }

  function addPlannedItem(item, replaceEntryId = '') {
    setPlan((currentPlan) => [
      ...currentPlan,
      {
        draftId: createId('draft'),
        previewEntryId: createId('preview'),
        itemId: item.id,
        sessionId: activeSession?.id,
        mode: getItemAcquisitionMode(item),
        cost: getItemCost(item),
        replaceEntryId,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function handleAddItem(item) {
    const pendingCost = getItemCost(item);

    if (confirmedScore === null) {
      return;
    }

    if (getItemAcquisitionMode(item) === 'purchase' && remainingScore < pendingCost) {
      return;
    }

    if (pendingSelection && pendingSelection.itemId === item.id) {
      setPendingSelection(null);
      return;
    }

    if (summary.projectedInventory.length >= 12) {
      setPendingSelection({
        itemId: item.id,
        itemName: item.name,
        cost: pendingCost,
        mode: getItemAcquisitionMode(item),
        replaceEntryId: '',
      });
      return;
    }

    setPendingSelection(null);
    addPlannedItem(item);
  }

  function handleSelectDiscardEntry(entry) {
    if (!pendingSelection || reservedDiscardEntryIds.includes(entry.id)) {
      return;
    }

    addPlannedItem(itemsById[pendingSelection.itemId], entry.id);
    setPendingSelection(null);
  }

  async function handleSubmitPlan() {
    if (confirmedScore === null || !activeSession || pendingSelection) {
      return;
    }

    try {
      await actions.submitRewardPlan({
        sessionId: activeSession.id,
        enteredScore: confirmedScore,
        plan,
      });
      navigate('/student/dashboard');
    } catch (error) {
      return;
    }
  }

  async function handleSavePet() {
    if (!selectedPet || !activeSession) {
      return;
    }

    const normalizedName = normalizeCustomName(petNameInput, PET_NAME_LIMIT);

    if (!normalizedName) {
      setPetError(TEXT.petNameError);
      return;
    }

    try {
      await actions.selectPet({
        sessionId: activeSession.id,
        itemId: selectedPet.id,
        customName: normalizedName,
        replaceEntryId: petNeedsDiscard ? petReplaceEntryId : '',
      });
      navigate('/student/dashboard');
    } catch (error) {
      return;
    }
  }

  async function handleSelectSpecialItem(item) {
    if (!activeSession || currentLessonSpecial) {
      return;
    }

    if (selectedSpecialId === item.id) {
      setSelectedSpecialId('');
      setSpecialReplaceEntryId('');
      return;
    }

    setSelectedSpecialId(item.id);
    setSpecialReplaceEntryId('');
  }

  function handleToggleMissionItem(item) {
    setSelectedMissionItemIds((current) => {
      if (current.includes(item.id)) {
        return current.filter((itemId) => itemId !== item.id);
      }

      return [...current, item.id];
    });
  }

  async function handleConfirmMissionItems() {
    if (!activeSession || !selectedMissionItemIds.length) {
      return;
    }

    try {
      await actions.selectMissionItems({
        sessionId: activeSession.id,
        itemIds: selectedMissionItemIds,
        replaceEntryIds: missionDiscardNeededCount ? missionReplaceEntryIds : [],
      });
      navigate('/student/dashboard');
    } catch (error) {
      return;
    }
  }

  async function handleConfirmSpecialItem() {
    if (!activeSession || !selectedSpecialItem) {
      return;
    }

    try {
      await actions.selectSpecialItem({
        sessionId: activeSession.id,
        itemId: selectedSpecialItem.id,
        replaceEntryId: specialNeedsDiscard ? specialReplaceEntryId : '',
      });
      navigate('/student/dashboard');
    } catch (error) {
      return;
    }
  }

  if (!activeSession) {
    return (
      <div className="stack-page">
        <PageHeader title={TEXT.noSessionTitle} description={TEXT.noSessionDescription} />
        <SectionCard>
          <EmptyState title={TEXT.noSessionEmptyTitle} description={TEXT.noSessionEmptyDescription} />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="stack-page">
      <PageHeader
        eyebrow={`${TEXT.currentSession}: ${activeSession.title}`}
        title={
          isPetSession
            ? TEXT.petTitle
            : isSpecialSession
              ? TEXT.specialTitle
              : isMissionSession
                ? TEXT.missionTitle
                : TEXT.title
        }
        description={
          isPetSession
            ? TEXT.petDescription
            : isSpecialSession
              ? TEXT.specialDescription
              : isMissionSession
                ? TEXT.missionDescription
                : TEXT.description
        }
      />

      {!activeSession.shopOpen ? (
        <SectionCard>
          <EmptyState title={TEXT.shopClosedTitle} description={TEXT.shopClosedDescription} />
        </SectionCard>
      ) : isPetSession ? (
        <>
          <SectionCard title={TEXT.petTitle} description={TEXT.petDescription}>
            {currentLessonPet ? (
              <div className="item-card">
                <AppImage
                  className="item-card__image"
                  src={currentLessonPet.image || itemsById[currentLessonPet.itemId]?.image}
                  fallbackSrc="/items/item-placeholder.png"
                  alt={currentLessonPet.customName}
                />
                <div className="item-card__content">
                  <div className="item-card__title-row">
                    <h3>{TEXT.petSelectedTitle}</h3>
                    <span className="chip">{TEXT.petBadge}</span>
                  </div>
                  <p>{TEXT.petSelectedDescription}</p>
                  <p>
                    <strong>{TEXT.petCurrentName}:</strong> {currentLessonPet.customName}
                  </p>
                  <p>
                    <strong>{TEXT.petCurrentSpecies}:</strong> {itemsById[currentLessonPet.itemId]?.name || TEXT.petLabelFallback}
                  </p>
                </div>
              </div>
            ) : petOptions.length ? (
              <div className="item-list">
                {petOptions.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selected={selectedPetId === item.id}
                    badgeLabel={selectedPetId === item.id ? TEXT.selected : TEXT.petBadge}
                    actionLabel={TEXT.petAction}
                    onAdd={(nextItem) => {
                      setSelectedPetId(nextItem.id);
                      setPetError('');
                      setPetReplaceEntryId('');
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={TEXT.petEmptyTitle} description={TEXT.petEmptyDescription} />
            )}
          </SectionCard>

          {!currentLessonPet && selectedPet && (
            <SectionCard title={TEXT.petNameTitle} description={TEXT.petNameDescription}>
              <div className="item-card">
                <AppImage
                  className="item-card__image"
                  src={selectedPet.image}
                  fallbackSrc="/items/item-placeholder.png"
                  alt={selectedPet.name}
                />
                <div className="item-card__content">
                  <div className="item-card__title-row">
                    <h3>{selectedPet.name}</h3>
                    <span className="chip chip--selected">{TEXT.petBadge}</span>
                  </div>
                  <p>{selectedPet.description}</p>
                </div>
              </div>

              <div className="form-grid">
                <label className="form-grid__full">
                  {TEXT.petNameLabel}
                  <input
                    value={petNameInput}
                    maxLength={PET_NAME_LIMIT}
                    placeholder={TEXT.petNamePlaceholder}
                    onChange={(event) => {
                      setPetNameInput(event.target.value);
                      setPetError('');
                    }}
                  />
                </label>
              </div>
              <p className="helper-text">{TEXT.petNameHint}</p>
              {petError && <p className="helper-text">{petError}</p>}
              <div className="quick-links">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={petNeedsDiscard && !petReplaceEntryId}
                  onClick={handleSavePet}
                >
                  {TEXT.petSave}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setSelectedPetId('');
                    setPetNameInput('');
                    setPetError('');
                    setPetReplaceEntryId('');
                  }}
                >
                  {TEXT.petCancel}
                </button>
              </div>
            </SectionCard>
          )}

          <SectionCard title={TEXT.inventoryTitle} description={petNeedsDiscard ? TEXT.petDiscardDescription : TEXT.petInventoryDescription}>
            <InventoryGrid
              inventory={currentStudent.inventory || []}
              itemsById={itemsById}
              selectable={petNeedsDiscard}
              selectedEntryId={petReplaceEntryId}
              dangerEntryIds={petReplaceEntryId ? [petReplaceEntryId] : []}
              actionLabel={TEXT.discardAction}
              onSelectEntry={(entry) => setPetReplaceEntryId((current) => (current === entry.id ? '' : entry.id))}
            />
          </SectionCard>
        </>
      ) : isSpecialSession ? (
        <>
          <SectionCard title={TEXT.specialTitle} description={TEXT.specialDescription}>
            {currentLessonSpecial ? (
              <div className="item-card">
                <AppImage
                  className="item-card__image"
                  src={currentLessonSpecial.image || itemsById[currentLessonSpecial.itemId]?.image}
                  fallbackSrc="/items/item-placeholder.png"
                  alt={itemsById[currentLessonSpecial.itemId]?.name || TEXT.specialBadge}
                />
                <div className="item-card__content">
                  <div className="item-card__title-row">
                    <h3>{TEXT.specialSelectedTitle}</h3>
                    <span className="chip">{TEXT.specialBadge}</span>
                  </div>
                  <p>{TEXT.specialSelectedDescription}</p>
                  <p>
                    <strong>{TEXT.specialCurrentItem}:</strong> {itemsById[currentLessonSpecial.itemId]?.name || TEXT.none}
                  </p>
                </div>
              </div>
            ) : specialOptions.length ? (
              <div className="item-list">
                {specialOptions.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selected={selectedSpecialId === item.id}
                    badgeLabel={selectedSpecialId === item.id ? TEXT.selected : TEXT.specialBadge}
                    actionLabel={TEXT.specialAction}
                    onAdd={handleSelectSpecialItem}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={TEXT.specialEmptyTitle} description={TEXT.specialEmptyDescription} />
            )}
          </SectionCard>

          {!currentLessonSpecial && selectedSpecialItem && (
            <SectionCard title={TEXT.specialTitle} description={TEXT.specialDescription}>
              <div className="item-card">
                <AppImage
                  className="item-card__image"
                  src={selectedSpecialItem.image}
                  fallbackSrc="/items/item-placeholder.png"
                  alt={selectedSpecialItem.name}
                />
                <div className="item-card__content">
                  <div className="item-card__title-row">
                    <h3>{selectedSpecialItem.name}</h3>
                    <span className="chip chip--selected">{TEXT.specialBadge}</span>
                  </div>
                  <p>{selectedSpecialItem.description}</p>
                </div>
              </div>
              <div className="quick-links">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={specialNeedsDiscard && !specialReplaceEntryId}
                  onClick={handleConfirmSpecialItem}
                >
                  {TEXT.specialConfirm}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setSelectedSpecialId('');
                    setSpecialReplaceEntryId('');
                  }}
                >
                  {TEXT.specialCancel}
                </button>
              </div>
            </SectionCard>
          )}

          <SectionCard title={TEXT.inventoryTitle} description={specialNeedsDiscard ? TEXT.specialDiscardDescription : TEXT.specialInventoryDescription}>
            <InventoryGrid
              inventory={currentStudent.inventory || []}
              itemsById={itemsById}
              selectable={specialNeedsDiscard}
              selectedEntryId={specialReplaceEntryId}
              dangerEntryIds={specialReplaceEntryId ? [specialReplaceEntryId] : []}
              actionLabel={TEXT.discardAction}
              onSelectEntry={(entry) => setSpecialReplaceEntryId((current) => (current === entry.id ? '' : entry.id))}
            />
          </SectionCard>
        </>
      ) : isMissionSession ? (
        <>
          {currentMissionItems.length > 0 && (
            <SectionCard title={TEXT.missionCurrentTitle} description={TEXT.missionCurrentDescription}>
              <div className="item-list">
                {currentMissionItems.map((entry) => {
                  const item = itemsById[entry.itemId];

                  if (!item) {
                    return null;
                  }

                  return (
                    <ItemCard
                      key={entry.id}
                      item={item}
                      selected
                      disabled
                      badgeLabel={TEXT.selected}
                      reason={TEXT.selected}
                      actionLabel={TEXT.selected}
                      onAdd={() => {}}
                    />
                  );
                })}
              </div>
            </SectionCard>
          )}

          <SectionCard title={TEXT.missionTitle} description={TEXT.missionDescription}>
            {availableMissionOptions.length ? (
              <>
                <div className="score-summary">
                  <div>
                    <span>{TEXT.missionRemainingSlots}</span>
                    <strong>{remainingInventorySlots}</strong>
                  </div>
                  <div>
                    <span>{TEXT.missionSelectedCount}</span>
                    <strong>{selectedMissionItemIds.length}</strong>
                  </div>
                  <div>
                    <span>{TEXT.missionDiscardPrefix}</span>
                    <strong>{missionDiscardNeededCount}</strong>
                  </div>
                </div>

                <div className="item-list">
                  {availableMissionOptions.map((item) => {
                    const isSelected = selectedMissionItemIds.includes(item.id);

                    return (
                      <ItemCard
                        key={item.id}
                        item={item}
                        selected={isSelected}
                        badgeLabel={isSelected ? TEXT.selected : TEXT.missionBadge}
                        actionLabel={isSelected ? TEXT.missionSelectedAction : TEXT.missionAction}
                        onAdd={handleToggleMissionItem}
                      />
                    );
                  })}
                </div>
              </>
            ) : currentMissionItems.length ? (
              <EmptyState title={TEXT.missionCurrentTitle} description={TEXT.missionCurrentDescription} />
            ) : (
              <EmptyState title={TEXT.missionEmptyTitle} description={TEXT.missionEmptyDescription} />
            )}
          </SectionCard>

          {selectedMissionItems.length > 0 && (
            <SectionCard title={TEXT.missionSelectionTitle} description={TEXT.missionSelectionDescription}>
              <div className="item-list">
                {selectedMissionItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selected
                    badgeLabel={TEXT.selected}
                    actionLabel={TEXT.missionSelectedAction}
                    onAdd={handleToggleMissionItem}
                  />
                ))}
              </div>
              <button
                type="button"
                className="button button--primary button--full"
                disabled={missionDiscardNeededCount > 0 && missionReplaceEntryIds.length !== missionDiscardNeededCount}
                onClick={handleConfirmMissionItems}
              >
                {TEXT.missionConfirm}
              </button>
            </SectionCard>
          )}

          <SectionCard
            title={TEXT.inventoryTitle}
            description={
              missionDiscardNeededCount > 0
                ? `${TEXT.discardSelectHelper}: ${missionDiscardNeededCount}개`
                : TEXT.missionInventoryDescription
            }
          >
            <InventoryGrid
              inventory={currentStudent.inventory || []}
              itemsById={itemsById}
              selectable={missionDiscardNeededCount > 0}
              dangerEntryIds={missionReplaceEntryIds}
              actionLabel={TEXT.discardAction}
              onSelectEntry={(entry) =>
                setMissionReplaceEntryIds((current) => {
                  if (current.includes(entry.id)) {
                    return current.filter((itemId) => itemId !== entry.id);
                  }

                  if (current.length >= missionDiscardNeededCount) {
                    return current;
                  }

                  return [...current, entry.id];
                })
              }
            />
          </SectionCard>
        </>
      ) : (
        <>
          <SectionCard title={TEXT.step1Title} description={TEXT.step1Description}>
            <div className="inline-form">
              <input value={scoreInput} onChange={(event) => setScoreInput(event.target.value)} inputMode="numeric" placeholder={TEXT.scorePlaceholder} />
              <button type="button" className="button button--primary" onClick={confirmScore}>
                {TEXT.confirmScore}
              </button>
              {confirmedScore !== null && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setConfirmedScore(null);
                    resetPlan();
                  }}
                >
                  {TEXT.resetScore}
                </button>
              )}
            </div>
          </SectionCard>

          <div className="dashboard-grid">
            <SectionCard title={TEXT.step2Title} description={TEXT.step2Description}>
              {confirmedScore === null ? (
                <EmptyState title={TEXT.needScoreTitle} description={TEXT.needScoreDescription} />
              ) : purchaseItems.length ? (
                <div className="item-list">
                  {purchaseItems.map((item) => {
                    const disabled =
                      confirmedScore === null ||
                      (getItemAcquisitionMode(item) === 'purchase' && remainingScore < getItemCost(item));

                    return (
                      <ItemCard
                        key={item.id}
                        item={item}
                        disabled={disabled}
                        reason={disabled ? TEXT.notEnoughScore : ''}
                        selected={pendingSelection?.itemId === item.id}
                        onAdd={handleAddItem}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState title={TEXT.emptyLessonItemsTitle} description={TEXT.emptyLessonItemsDescription} />
              )}
            </SectionCard>

            <SectionCard title={TEXT.step3Title} description={TEXT.step3Description}>
              <div className="score-summary">
                <div>
                  <span>{TEXT.enteredScore}</span>
                  <strong>{confirmedScore ?? '-'}</strong>
                </div>
                <div>
                  <span>{TEXT.spentScore}</span>
                  <strong>{confirmedScore === null ? '-' : summary.spentScore}</strong>
                </div>
                <div>
                  <span>{TEXT.remainingScore}</span>
                  <strong>{confirmedScore === null ? '-' : remainingScore}</strong>
                </div>
              </div>

              <div className="reward-preview">
                <div className={`reward-preview__card ${pendingSelection || summaryDiscardItem ? 'reward-preview__card--active' : ''}`.trim()}>
                  <span>{TEXT.discardItem}</span>
                  <strong>{summaryDiscardItem?.name || (pendingSelection ? TEXT.chooseFromInventory : TEXT.none)}</strong>
                </div>
                <div className={`reward-preview__card ${pendingSelection || summaryIncomingItem ? 'reward-preview__card--incoming' : ''}`.trim()}>
                  <span>{TEXT.incomingItem}</span>
                  <strong>{summaryIncomingItem?.name || TEXT.none}</strong>
                </div>
              </div>

              {plan.length ? (
                <ul className="plan-list">
                  {plan.map((step) => (
                    <li key={step.draftId}>
                      <div>
                        <strong>{itemsById[step.itemId]?.name}</strong>
                        <p>
                          {step.replaceEntryId
                            ? `${TEXT.discardPrefix} ${itemsById[currentStudent.inventory.find((entry) => entry.id === step.replaceEntryId)?.itemId]?.name || '-'}`
                            : TEXT.discardNone}
                        </p>
                        <p>{step.cost ? `${step.cost}${TEXT.scoreSuffix}` : TEXT.bonusItem}</p>
                      </div>
                      <button
                        type="button"
                        className="button button--ghost button--small"
                        onClick={() => setPlan((currentPlan) => currentPlan.filter((item) => item.draftId !== step.draftId))}
                      >
                        {TEXT.removePlan}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title={TEXT.noPlannedItemsTitle} description={TEXT.noPlannedItemsDescription} />
              )}

              <button
                type="button"
                className="button button--primary button--full"
                disabled={confirmedScore === null || Boolean(pendingSelection)}
                onClick={handleSubmitPlan}
              >
                {TEXT.confirmReward}
              </button>
            </SectionCard>
          </div>

          <SectionCard
            title={TEXT.inventoryTitle}
            description={pendingSelection ? `${pendingSelection.itemName}${TEXT.inventoryDescriptionWithPending}` : TEXT.inventoryDescription}
          >
            <InventoryGrid
              inventory={currentStudent.inventory || []}
              itemsById={itemsById}
              selectable={Boolean(pendingSelection)}
              selectedEntryId={pendingSelection?.replaceEntryId || ''}
              dangerEntryIds={pendingSelection?.replaceEntryId ? [pendingSelection.replaceEntryId] : reservedDiscardEntryIds}
              disabledEntryIds={reservedDiscardEntryIds}
              actionLabel={TEXT.discardAction}
              onSelectEntry={handleSelectDiscardEntry}
            />
            {pendingSelection && (
              <div className="inventory-selection-helper">
                <p>{TEXT.pendingHelper}</p>
                <button type="button" className="button button--ghost" onClick={() => setPendingSelection(null)}>
                  {TEXT.cancelPending}
                </button>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
