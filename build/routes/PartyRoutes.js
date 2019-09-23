"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _PartyController = _interopRequireDefault(require("../controllers/PartyController"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var createParty = _PartyController["default"].createParty,
    filterPartiesByUser = _PartyController["default"].filterPartiesByUser,
    viewSingleParty = _PartyController["default"].viewSingleParty;
var router = (0, _express.Router)();
router.post('/', _auth["default"], createParty);
router.get('/createdby/:user_id', filterPartiesByUser);
router.get('/:party_id', viewSingleParty);
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=PartyRoutes.js.map