export interface Weapon {
  id: string;
  name: string;
  description: string;
  atk: number;
  rarity: 'Legendary' | 'Epic' | 'Rare' | 'Common';
  image: string;
  detailedStats: {
    range: string;
    fireRate: string;
    weight: string;
  };
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  def: number;
  type: 'Support' | 'Attack' | 'Defense';
  image: string;
  detailedStats: {
    radius: string;
    recharge: string;
    duration: string;
  };
}

export type GameScreen = 'HUB' | 'MAP' | 'COMBAT' | 'REGISTRY';
