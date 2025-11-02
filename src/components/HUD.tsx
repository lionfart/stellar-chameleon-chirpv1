import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/Progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Shield, Gem, Clock, Swords, Bomb } from 'lucide-react';

export interface HUDProps {
  playerHealth: number;
  playerMaxHealth: number;
  playerLevel: number;
  playerExperience: number;
  playerExperienceToNextLevel: number;
  playerGold: number;
  shieldActive: boolean;
  shieldCurrentHealth: number;
  shieldMaxHealth: number;
  waveNumber: number;
  waveTimeRemaining: number;
  // New cooldown props
  dashCooldownCurrent: number;
  dashCooldownMax: number;
  explosionCooldownCurrent: number;
  explosionCooldownMax: number;
  shieldCooldownCurrent: number;
  shieldCooldownMax: number;
}

const HUD: React.FC<HUDProps> = ({
  playerHealth,
  playerMaxHealth,
  playerLevel,
  playerExperience,
  playerExperienceToNextLevel,
  playerGold,
  shieldActive,
  shieldCurrentHealth,
  shieldMaxHealth,
  waveNumber,
  waveTimeRemaining,
  // New cooldown props
  dashCooldownCurrent,
  dashCooldownMax,
  explosionCooldownCurrent,
  explosionCooldownMax,
  shieldCooldownCurrent,
  shieldCooldownMax,
}) => {
  const healthPercentage = (playerHealth / playerMaxHealth) * 100;
  const xpPercentage = (playerExperience / playerExperienceToNextLevel) * 100;
  const shieldPercentage = shieldMaxHealth > 0 ? (shieldCurrentHealth / shieldMaxHealth) * 100 : 0;

  // Cooldown percentages
  const dashCooldownPercentage = dashCooldownMax > 0 ? ((dashCooldownMax - dashCooldownCurrent) / dashCooldownMax) * 100 : 100;
  const explosionCooldownPercentage = explosionCooldownMax > 0 ? ((explosionCooldownMax - explosionCooldownCurrent) / explosionCooldownMax) * 100 : 100;
  const shieldAbilityCooldownPercentage = shieldCooldownMax > 0 ? ((shieldCooldownMax - shieldCooldownCurrent) / shieldCooldownMax) * 100 : 100;

  // Cooldown text
  const getCooldownText = (current: number) => current > 0 ? `${current.toFixed(1)}s` : 'Ready';

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-40">
      {/* Left HUD - Player Stats */}
      <Card className="bg-background/80 backdrop-blur-sm p-3 shadow-lg border-none min-w-[250px] max-h-[calc(50vh-2rem)] overflow-y-auto">
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <Progress value={healthPercentage} className="h-2" indicatorClassName="bg-red-500" />
              <span className="text-xs text-muted-foreground">{playerHealth}/{playerMaxHealth} HP</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <Progress value={xpPercentage} className="h-2" indicatorClassName="bg-blue-500" />
              <span className="text-xs text-muted-foreground">{playerExperience}/{playerExperienceToNextLevel} XP</span>
            </div>
            <Badge variant="secondary" className="text-sm">Lv. {playerLevel}</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Gem className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">{playerGold} Gold</span>
          </div>

          {shieldMaxHealth > 0 && (
            <div className="flex items-center space-x-2">
              <Shield className={`h-5 w-5 ${shieldActive ? 'text-cyan-400' : 'text-gray-500'}`} />
              <div className="flex-1">
                <Progress value={shieldPercentage} className="h-2" indicatorClassName="bg-cyan-400" />
                <span className="text-xs text-muted-foreground">
                  {shieldActive ? `${shieldCurrentHealth}/${shieldMaxHealth} Shield` : 'Shield Inactive'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom-Left HUD - Ability Cooldowns */}
      <Card className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-3 shadow-lg border-none min-w-[200px] max-h-[calc(50vh-2rem)] overflow-y-auto">
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <div className="flex-1">
              <Progress
                value={dashCooldownPercentage}
                className="h-5"
                indicatorClassName="bg-purple-500"
                showText
                text={`Dash: ${getCooldownText(dashCooldownCurrent)}`}
                isCooldown={dashCooldownCurrent > 0}
              />
            </div>
          </div>

          {explosionCooldownMax > 0 && (
            <div className="flex items-center space-x-2">
              <Bomb className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <Progress
                  value={explosionCooldownPercentage}
                  className="h-5"
                  indicatorClassName="bg-orange-500"
                  showText
                  text={`Explosion: ${getCooldownText(explosionCooldownCurrent)}`}
                  isCooldown={explosionCooldownCurrent > 0}
                />
              </div>
            </div>
          )}

          {shieldCooldownMax > 0 && (
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <Progress
                  value={shieldAbilityCooldownPercentage}
                  className="h-5"
                  indicatorClassName="bg-blue-500"
                  showText
                  text={`Shield: ${getCooldownText(shieldCooldownCurrent)}`}
                  isCooldown={shieldCooldownCurrent > 0}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right HUD - Wave Info */}
      <Card className="bg-background/80 backdrop-blur-sm p-3 shadow-lg border-none min-w-[180px] text-right">
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center justify-end space-x-2">
            <Swords className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Wave {waveNumber}</span>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">{Math.max(0, Math.floor(waveTimeRemaining))}s</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HUD;