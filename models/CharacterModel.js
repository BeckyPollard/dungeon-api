const mongoose = require('mongoose');

const AbilityScoreSchema = new mongoose.Schema({
  value: {type: Number, default: 10},
  mod: {type: Number, default: 0},
  savingThrow: {type: Number, default: 0},
  arcana: {type: Number} // Included since 'int' has this extra field
}, {_id: false});

const SkillSchema = new mongoose.Schema({
  name: {type: String, required: true},
  ability: {type: String, required: true},
  modifier: {type: Number, default: 0},
  proficient: {type: Boolean, default: false}
}, {_id: false});

const CustomFieldSchema = new mongoose.Schema({
  type: {type: String},
  text: {type: String}
}, {_id: false});

const ActionItemSchema = new mongoose.Schema({
  name: {type: String, required: true},
  subtitle: {type: String},
  hit: {type: String},
  damage: {type: String},
  range: {type: mongoose.Schema.Types.Mixed}, // Handles both strings ("5 ft") and numbers (120)
  castTime: {type: String},
  time: {type: String},
  effect: {type: String},
  duration: {type: String},
  reference: {type: Boolean},
  description: {type: String},
  level: {type: Number},
  slots: {type: Number},
  usedSlots: {type: Number},
  customFields: [CustomFieldSchema]
}, {_id: false});

const QuestObjectiveSchema = new mongoose.Schema({
  item: {type: String, required: true},
  status: {type: String, default: 'pending'} // e.g., 'pending', 'done'
}, {_id: false});

const QuestSchema = new mongoose.Schema({
  title: {type: String, required: true},
  type: {type: String, default: 'main'}, // e.g., 'main', 'side'
  description: {type: String},
  descriptionSpoiler: {type: String},
  startDate: {type: String},
  endDate: {type: String},
  finished: {type: Boolean, default: false},
  objectives: [QuestObjectiveSchema],
  result: {type: String},
  resultSpoiler: {type: String},
  rewards: {type: String}
}, {_id: false});

// --- MAIN CHARACTER SCHEMA ---

const CharacterSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Character has to be authored by a player.']
  },
  firstname: {
    type: String,
    required: [true, 'First name required'],
    trim: true
  },
  lastname: {
    type: String,
    required: [true, 'Last name required'],
    trim: true
  },
  race: {
    type: String,
    required: [true, 'Race required'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class required'],
    trim: true
  },
  status: {
    level: {type: Number, default: 1},
    hitDice: {type: String},
    movement: {type: Number, default: 30},
    magicType: {type: String}
  },
  bonuses: {
    inspiration: {type: Boolean, default: false}
  },
  health: {
    maxHP: {type: Number, default: 10},
    currentHP: {type: Number, default: 10},
    tempHP: {type: Number, default: 0}
  },
  abilities: {
    str: AbilityScoreSchema,
    dex: AbilityScoreSchema,
    con: AbilityScoreSchema,
    int: AbilityScoreSchema,
    wis: AbilityScoreSchema,
    cha: AbilityScoreSchema
  },
  skills: [SkillSchema],
  featuresTraits: [{type: String}],
  proficienciesSkills: [{type: String}],
  customStatsLists: [{
    title: {type: String},
    subtitle: {type: String},
    list: [{type: String}]
  }],
  actions: {
    melee: [ActionItemSchema],
    healing: [ActionItemSchema],
    cantrips: [ActionItemSchema],
    spellSlots: [ActionItemSchema],
    spells: [ActionItemSchema],
    specials: [ActionItemSchema]
  },
  inventory: {
    money: [{
      currency: {type: String},
      amount: {type: Number, default: 0}
    }],
    items: [{
      title: {type: String},
      weight: {type: Number},
      quantity: {type: Number}
    }],
    equipment: [{
      title: {type: String},
      weight: {type: Number}
    }]
  },
  quests: [QuestSchema],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

CharacterSchema.pre('save', async function(next) {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('Character', CharacterSchema);
