"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_1 = require("../controllers/Auth/login");
const register_1 = require("../controllers/Auth/register");
const refresh_1 = require("../controllers/Auth/refresh");
const router = (0, express_1.Router)();
router.post(`/user/login`, login_1.login);
router.post("/user/register", register_1.register);
router.post("/user/refresh", refresh_1.refresh);
exports.default = router;
