// utils/visualMapper.ts
import {
    House,
    Calendar,
    Hammer,
    Clock,
    DollarSign,
    Bed,
    Key,
    DoorOpen,
    Search,
    MapPin,
    TrendingUp,
    Target,
    Mail,
    Home,
    Eye,
    Sparkles,
  } from 'lucide-react';
  
  // Map question ID or flow type → actual emoji or icon
  export const VISUAL_MAP = {
    // Emojis (as string → actual character)
    house: 'house',
    key: 'key',
    eyes: 'eyes',
    calendar: 'calendar',
    hammer: 'hammer',
    stopwatch: 'stopwatch',
    moneybag: 'moneybag',
    bed: 'bed',
    door: 'door',
    'magnifying-glass-tilted-left': 'magnifying-glass-tilted-left',
    pin: 'pin',
    'chart-increasing': 'chart-increasing',
    bullseye: 'bullseye',
    envelope: 'envelope',
  
    // Lucide Icons (as component)
    Home: Home,
    Eye: Eye,
    Sparkles: Sparkles,
    // ... add more as needed
  } as const;