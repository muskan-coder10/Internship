import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Video from "./models/Video.js";

dotenv.config();

const addVideos = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const user = await User.findOne({ username: "democreator" });

  if (!user) {
    console.log("User not found");
    process.exit(1);
  }

  const newVideos = [
    {
      title: " Meri Zindagi Hai Tu ",
      description: "Enjoy the soulful melody of Meri Zindagi Hai Tu —a heartfelt romantic song filled with love, emotions, and beautiful music that touches the heart. ❤️🎶",
      thumbnail: " https://tse2.mm.bing.net/th?id=OIF.LUoUGYmHFCdLREVTH%2bQxRg&pid=Api&P=0&h=180",
      videoUrl: "izdeBydQFFA",
      category: "Song",
      channel: user._id,
      views: 802066,
      likes: 1090000,
    },
    {
      title: " Introduction to React Js + Installation | Complete React Course in Hindi #1 ",
      description: "Start your React.js journey with this beginner-friendly tutorial! In this video, you'll learn what React.js is, why it's so popular, and how to install and set up a React project using Vite. Perfect for beginners who want to build modern web applications. 🚀",
      thumbnail: "https://tse1.mm.bing.net/th/id/OIP.NzyS_9Oqzfnguqb9UHtixwHaEK?pid=Api&P=0&h=180",
      videoUrl: "-mJFZp84TIY",
      category: "React Js",
      channel: user._id,
      views: 802066,
      likes: 1090000,
    },
    {
      title: "Unit-4 I Multiple integration I ONE SHOT I Engg. Maths-I by Gulshan Sir I Gateway Classes",
      description: "Ace Unit-4 Multiple Integration in one shot with this complete Engineering Mathematics-I lecture by Gulshan Sir. Learn all important concepts, formulas, and problem-solving techniques for semester exams in an easy and exam-oriented way. Perfect for last-minute revision and scoring high marks. 📚✨",
      thumbnail: "https://tse2.mm.bing.net/th/id/OIP.qjvBXpgX4irh0EjEfapohAHaEK?pid=Api&P=0&h=180",
      videoUrl: "HVqC8jFOx2k",
      category: "Btech 1st year",
      channel: user._id,
      views: 802066,
      likes: 1090000,
    },
  ];

  let addedCount = 0;
  let skippedCount = 0;

  for (const video of newVideos) {
    const exists = await Video.findOne({ title: video.title });

    if (exists) {
      console.log(`Skipped (already exists): ${video.title}`);
      skippedCount++;
    } else {
      await Video.create(video);
      console.log(`Added: ${video.title}`);
      addedCount++;
    }
  }

  console.log(`Done — ${addedCount} added, ${skippedCount} skipped`);
  process.exit(0);
};

addVideos();