import { 
  Coffee, 
  Utensils, 
  Star, 
  Beer, 
  Gift, 
  Flame, 
  Smile, 
  HeartPulse, 
  Activity, 
  Sparkles, 
  Scissors, 
  Dumbbell, 
  ShieldCheck,
  Award
} from 'lucide-react';

export function getStampIconComponent(iconId) {
  switch (iconId) {
    case 'tooth':
    case 'dental':
      return Smile;
    case 'stethoscope':
    case 'clinic':
    case 'medical':
      return HeartPulse;
    case 'spa':
    case 'beauty':
      return Sparkles;
    case 'scissors':
    case 'salon':
      return Scissors;
    case 'fitness':
    case 'gym':
      return Dumbbell;
    case 'cup':
    case 'coffee':
      return Coffee;
    case 'utensils':
    case 'dining':
      return Utensils;
    case 'star':
      return Star;
    case 'fire':
    case 'grill':
      return Flame;
    case 'gift':
      return Gift;
    case 'beer':
    case 'bar':
      return Beer;
    case 'shield':
      return ShieldCheck;
    default:
      return Coffee;
  }
}
