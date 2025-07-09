"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    findAll() {
        return this.model.find();
    }
    findById(id, lean) {
        return lean ? this.model.findById(id).lean() : this.model.findById(id);
    }
    findOne(query, lean) {
        return lean
            ? this.model
                .findOne(Object.assign({}, query))
                .lean()
            : this.model.findOne(Object.assign({}, query));
    }
    deleteById(id, session) {
        return this.model.findByIdAndDelete(id).session(session);
    }
    save(document, session) {
        return document.save({ session });
    }
}
exports.default = BaseRepository;
