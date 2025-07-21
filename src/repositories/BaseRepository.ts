import { ClientSession, HydratedDocument, Model } from "mongoose";

export default class BaseRepository<T> {
  constructor(private model: Model<T>) {}

  findAll() {
    return this.model.find();
  }

  findById(id: string, lean: boolean) {
    return lean ? this.model.findById(id).lean() : this.model.findById(id);
  }

  findOne(query: any, lean: boolean) {
    console.log(query);

    return lean
      ? this.model
          .findOne({
            ...query,
          })
          .lean()
      : this.model.findOne({
          ...query,
        });
  }

  findByIdAndUpdate(id: string, data: {}) {
    return this.model.findByIdAndUpdate(
      id,
      {
        $set: {
          ...data,
        },
      },
      {
        new: true,
        lean: true,
      }
    );
  }

  deleteById(id: string, session: ClientSession) {
    return this.model.findByIdAndDelete(id).session(session);
  }

  save(document: HydratedDocument<T>, session?: ClientSession) {
    return document.save({ session });
  }
}
