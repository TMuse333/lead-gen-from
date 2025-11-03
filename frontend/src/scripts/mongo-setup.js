"use strict";
// ============================================
// MONGODB SETUP SCRIPT
// ============================================
// Run this once to set up collections and indexes
// Usage: npx tsx scripts/setup-mongodb.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("../lib/mongodb/mongodb");
var models_1 = require("../lib/mongodb/models");
require("dotenv/config");
var dotenv_1 = require("dotenv");
dotenv_1.default.config({ path: '../../.env' });
function setupMongoDB() {
    return __awaiter(this, void 0, void 0, function () {
        var db, existingCollections, collectionNames, collections, _i, collections_1, collectionName, leadsCollection, _a, _b, indexSpec, error_1, formConfigsCollection, _c, _d, indexSpec, error_2, agentsCollection, error_3, error_4, error_5;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 27, , 28]);
                    console.log('🚀 Starting MongoDB setup...\n');
                    return [4 /*yield*/, (0, mongodb_1.getDatabase)()];
                case 1:
                    db = _e.sent();
                    console.log('✅ Connected to MongoDB');
                    console.log("\uD83D\uDCE6 Database: ".concat(db.databaseName, "\n"));
                    return [4 /*yield*/, db.listCollections().toArray()];
                case 2:
                    existingCollections = _e.sent();
                    collectionNames = existingCollections.map(function (c) { return c.name; });
                    collections = ['leads', 'form_configs', 'agents'];
                    _i = 0, collections_1 = collections;
                    _e.label = 3;
                case 3:
                    if (!(_i < collections_1.length)) return [3 /*break*/, 7];
                    collectionName = collections_1[_i];
                    if (!!collectionNames.includes(collectionName)) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.createCollection(collectionName)];
                case 4:
                    _e.sent();
                    console.log("\u2705 Created collection: ".concat(collectionName));
                    return [3 /*break*/, 6];
                case 5:
                    console.log("\u23ED\uFE0F  Collection already exists: ".concat(collectionName));
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    console.log('\n📊 Creating indexes...\n');
                    leadsCollection = db.collection('leads');
                    _a = 0, _b = models_1.COLLECTION_INDEXES.leads;
                    _e.label = 8;
                case 8:
                    if (!(_a < _b.length)) return [3 /*break*/, 13];
                    indexSpec = _b[_a];
                    _e.label = 9;
                case 9:
                    _e.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, leadsCollection.createIndex(indexSpec)];
                case 10:
                    _e.sent(); // ✅ Changed: removed .key
                    console.log("\u2705 Created index on leads:", JSON.stringify(indexSpec));
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _e.sent();
                    if (error_1.code === 85 || error_1.code === 86) {
                        console.log("\u23ED\uFE0F  Index already exists on leads:", JSON.stringify(indexSpec));
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 12];
                case 12:
                    _a++;
                    return [3 /*break*/, 8];
                case 13:
                    formConfigsCollection = db.collection('form_configs');
                    _c = 0, _d = models_1.COLLECTION_INDEXES.form_configs;
                    _e.label = 14;
                case 14:
                    if (!(_c < _d.length)) return [3 /*break*/, 19];
                    indexSpec = _d[_c];
                    _e.label = 15;
                case 15:
                    _e.trys.push([15, 17, , 18]);
                    return [4 /*yield*/, formConfigsCollection.createIndex(indexSpec)];
                case 16:
                    _e.sent(); // ✅ Changed: removed .key
                    console.log("\u2705 Created index on form_configs:", JSON.stringify(indexSpec));
                    return [3 /*break*/, 18];
                case 17:
                    error_2 = _e.sent();
                    if (error_2.code === 85 || error_2.code === 86) {
                        console.log("\u23ED\uFE0F  Index already exists on form_configs:", JSON.stringify(indexSpec));
                    }
                    else {
                        throw error_2;
                    }
                    return [3 /*break*/, 18];
                case 18:
                    _c++;
                    return [3 /*break*/, 14];
                case 19:
                    agentsCollection = db.collection('agents');
                    _e.label = 20;
                case 20:
                    _e.trys.push([20, 22, , 23]);
                    return [4 /*yield*/, agentsCollection.createIndex({ userId: 1 }, { unique: true })];
                case 21:
                    _e.sent();
                    console.log("\u2705 Created unique index on agents: {\"userId\":1}");
                    return [3 /*break*/, 23];
                case 22:
                    error_3 = _e.sent();
                    if (error_3.code === 85 || error_3.code === 86) {
                        console.log("\u23ED\uFE0F  Index already exists on agents: {\"userId\":1}");
                    }
                    else {
                        throw error_3;
                    }
                    return [3 /*break*/, 23];
                case 23:
                    _e.trys.push([23, 25, , 26]);
                    return [4 /*yield*/, agentsCollection.createIndex({ email: 1 }, { unique: true })];
                case 24:
                    _e.sent();
                    console.log("\u2705 Created unique index on agents: {\"email\":1}");
                    return [3 /*break*/, 26];
                case 25:
                    error_4 = _e.sent();
                    if (error_4.code === 85 || error_4.code === 86) {
                        console.log("\u23ED\uFE0F  Index already exists on agents: {\"email\":1}");
                    }
                    else {
                        throw error_4;
                    }
                    return [3 /*break*/, 26];
                case 26:
                    console.log('\n🎉 MongoDB setup complete!\n');
                    console.log('📊 Summary:');
                    console.log("   \u2022 Database: ".concat(db.databaseName));
                    console.log("   \u2022 Collections: ".concat(collections.join(', ')));
                    console.log("   \u2022 Indexes created for optimal querying");
                    console.log('\n✅ You can now start using the database!\n');
                    process.exit(0);
                    return [3 /*break*/, 28];
                case 27:
                    error_5 = _e.sent();
                    console.error('❌ Error setting up MongoDB:', error_5);
                    process.exit(1);
                    return [3 /*break*/, 28];
                case 28: return [2 /*return*/];
            }
        });
    });
}
setupMongoDB();
