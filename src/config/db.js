import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log('env data is ', process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI);

    const db= mongoose.connection;
    const host= db.host;
    const port= db.port;
    const name = db.name;
    console.log("MongoDB connected ✅ on port ", port, "host-", host, "database:-", name);
  } catch (error) {
    console.error("MongoDB connection failed ❌", error);
    process.exit(1);
  }
};

export default connectDB;
