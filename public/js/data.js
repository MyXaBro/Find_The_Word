// Массивы объектов (животные, вопросы и т.д.)
export const animals = [
  {
    name: 'Слон',
    legs: 4,
    hasFur: false,
    canSwim: false,
    canFly: false,
  
    canDraw: true, 
    canBuryDead: true,
  },
  {
    name: 'Кенгуру',
    legs: 2,
    hasFur: false,
    canSwim: false,
    canFly: false,
    canBoxing: true,
    hasBag: true,      
    canLiveNoWater: true, 
  },
  {
    name: 'Верблюд',
    legs: 4,
    hasFur: false,
    canSwim: false,
    canFly: false,
  
    hasHump: true,       
    canLiveNoWater: true,
  },
  {
    name: 'Утка',
    legs: 2,
    hasFur: false,
    canSwim: true,
    canFly: true,
  }
];

export const questions = [
  { text: 'У кого 4 ноги?',           property: 'legs',          value: 4 },
  { text: 'Кто плавает?',             property: 'canSwim',       value: true },
  { text: 'Кто умеет боксировать?',   property: 'canBoxing',     value: true },
  { text: 'Кто умеет летать?',        property: 'canFly',        value: true },
  { text: 'Кто умеет рисовать?',      property: 'canDraw',       value: true },
  { text: 'У кого есть сумка?',       property: 'hasBag',        value: true },
  { text: 'Кто хоронит своих?',       property: 'canBuryDead',   value: true },
  { text: 'Кто способен жить без воды несколько месяцев?',  property: 'canLiveNoWater', value: true },
  { text: 'У кого есть горб на спине?', property: 'hasHump',      value: true },
];
