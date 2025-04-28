"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const FriendListSchema = new mongoose_1.Schema({
    contactId: mongoose_1.default.Schema.Types.ObjectId,
    roomId: mongoose_1.default.Schema.Types.ObjectId,
}, {
    _id: false,
});
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    profilePic: {
        type: String,
        default: null,
    },
    about: {
        type: String,
        default: null,
    },
    following: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        default: [],
        ref: "User",
    },
    followers: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        default: [],
        ref: "User",
    },
    friendList: {
        type: [FriendListSchema],
        default: [],
        ref: "User",
    },
    friendRequestList: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        default: [],
        ref: "User",
    },
    favouritesContactList: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        default: [],
    },
    blacklist: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        default: [],
        ref: "user",
    },
    // access_token: String,
    // refresh_token: String,
    // access_token_expiry: String,
    // refresh_token_expiry: String,
}, {
    timestamps: true,
});
const User = mongoose_1.models.User || mongoose_1.default.model("User", UserSchema, "users");
exports.default = User;
