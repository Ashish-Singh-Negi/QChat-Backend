import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI!);

    console.log(`Connected to DB Succesfully.`);
  } catch (error) {
    console.error("Error while connecting to DB : ", error);
    process.exit(1);
  }
};

export default connectToDB;
