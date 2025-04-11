import React from 'react';
import SpaceInvadersGame from '@/components/mini-games/space-invaders/SpaceInvadersGame';

const SpaceInvadersPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Simple Space Invaders</h1>
      <SpaceInvadersGame />
    </div>
  );
};

export default SpaceInvadersPage;
