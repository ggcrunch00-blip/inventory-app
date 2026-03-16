import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';

export default function CharacterSelectionPage() {
  const { currentStudent, characters, actions } = useAppContext();
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState(currentStudent?.selectedCharacter || '');

  if (!currentStudent) {
    return <Navigate to="/login" replace />;
  }

  if (currentStudent.selectedCharacter) {
    return <Navigate to="/student/dashboard" replace />;
  }

  async function handleConfirm() {
    if (!selectedCharacter) {
      return;
    }

    try {
      await actions.selectCharacter(selectedCharacter);
      navigate('/student/dashboard');
    } catch (error) {
      return;
    }
  }

  return (
    <div className="stack-page">
      <PageHeader
        eyebrow="첫 로그인"
        title="내 캐릭터를 골라 주세요"
        description="한 번 고르면 이번 학기 동안 계속 사용합니다. 바꾸려면 선생님이 초기화해야 해요."
      />

      <div className="character-grid">
        {characters.map((character) => (
          <button
            key={character.id}
            type="button"
            className={`character-card ${selectedCharacter === character.id ? 'character-card--selected' : ''}`}
            onClick={() => setSelectedCharacter(character.id)}
          >
            <img src={character.imageUrl} alt={character.name} />
            <strong>{character.name}</strong>
            <p>{character.summary}</p>
          </button>
        ))}
      </div>

      <SectionCard title="선택 확인" description="선택한 뒤 바로 인벤토리 화면으로 이동합니다.">
        <button type="button" className="button button--primary" disabled={!selectedCharacter} onClick={handleConfirm}>
          이 캐릭터로 시작하기
        </button>
      </SectionCard>
    </div>
  );
}

