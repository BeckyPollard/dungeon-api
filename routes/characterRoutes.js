// THE PLAN
// 1. first we just wanna get all the character info dumped into one endpoint /characters/NAME#
// 2. then we might break the data into subject-oriented endpoints /characters/NAME/quests
// 3. fun

const express = require('express');
const {check, validationResult} = require('express-validator'); // https://express-validator.github.io/docs/
const Character = require('../models/CharacterModel');
const {authenticate} = require('../middleware/authenticate');
const logger = require('../config/logger');

const router = express.Router(); //https://expressjs.com/en/5x/api/router/

// TODO after schema is made
const validateCharacter = [
  // https://express-validator.github.io/docs/api/check/
  check('firstname', 'First name required').notEmpty().trim(),
  check('lastname', 'Last name required').notEmpty().trim(),
];

// GET /api/v1/characters/all
router.get('/characters', authenticate, async (req, res, next) => {
  try {
    const characters = await Character.find({author: req.user.id});

    res.status(200).json(characters);
  } catch(error) {
    next(error);
  }
});

// POST /api/v1/characters/all
router.post('/characters', authenticate, validateCharacter, async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    logger.warn(`Validation fail for character create.}`);
    return res.status(400).json({errors: errors.array()});
  }

  const {firstname, lastname} = req.body;

  try {
    const characterExists = await Character.findOne({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      author: req.user.id
    });

    if(characterExists) {
      logger.warn(`Creation failed because character ${firstname} ${lastname} already exists.`);
      return res.status(409).json({
        status: false,
        message: 'Character with that name already exists.'
      });
    }

    const character = new Character({...req.body, author: req.user.id});
    await character.save();

    logger.info(`Character ${character._id} created by user ${req.user.id}`);
    res.status(201).json({message: 'Character created.', character_id: character._id});
  } catch(error) {
    next(error);
  }
});

// GET /api/v1/characters/:id
router.get('/characters/:id', authenticate, async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id);

    if(!character) {
      logger.warn(`Character ${req.params.id} does not exist.`);
      return res.status(404).json({error: 'Character record not found.'});
    }

    if(character.user.toString() !== req.user.id) {
      logger.warn(`User ${req.user.id} denied access to character ${req.params.id}`);
      return res.status(403).json({error: "Access denied, you don't own this character."});
    }

    res.status(200).json(character);
  } catch(error) {
    next(error);
  }
});

// PUT /api/v1/characters/:id
router.put('/characters/:id', authenticate, validateCharacter, async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

  try {
    const characterCheck = await Character.findById(req.params.id);
    if(!characterCheck) return res.status(404).json({error: 'Character record not found.'});

    if(characterCheck.user.toString() !== req.user.id) {
      logger.warn(`User ${req.user.id} denied to edit character ${req.params.id}`);
      return res.status(403).json({error: "Access denied, you don't own this character."});
    }

    const character = await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true, runValidators: true}
    );

    logger.info(`Character ${character._id} updated by user ${req.user.id}`);
    res.status(200).json({message: 'Character updated.', character});
  } catch(error) {
    next(error);
  }
});

// DELETE /api/v1/characters?id=xxx
router.delete('/characters', authenticate, async (req, res, next) => {
  const characterId = req.query.id;

  if(!characterId) {
    return res.status(400).json({error: 'Character ID required'});
  }

  try {
    const characterCheck = await Character.findById(characterId);
    if(!characterCheck) {
      return res.status(404).json({error: 'Character not found.'});
    }

    if(characterCheck.user.toString() !== req.user.id) {
      logger.warn(`User ${req.user.id} denied to delete character ${characterId}`);
      return res.status(403).json({error: "Access denied, you don't own this character."});
    }

    await Character.findByIdAndDelete(characterId);
    logger.info(`Character ${characterId} deleted by user ${req.user.id}`);

    res.status(204).send();
  } catch(error) {
    next(error);
  }
});

module.exports = router;
