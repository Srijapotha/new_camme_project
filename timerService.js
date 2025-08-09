const User = require("./models/userModel");

setInterval(async () => {
    const users = await User.find({ loginStartTime: { $ne: null }, hasExceededLimit: false });

    const now = new Date();

    for (const user of users) {
        const elapsedSeconds = Math.floor((now - user.loginStartTime) / 1000);
        user.totalSessionTime = elapsedSeconds;

        if (elapsedSeconds > 9300) { // 2h 35m
            console.log(`⚠️ User ${user._id} exceeded time limit (2h 35m).`);

            // ✅ Prevent repeated point addition by setting this first
            user.hasExceededLimit = true;

            // Award 25 points
            user.points = (user.points || 0) + 25;
            console.log(`✅ User ${user._id} awarded 25 points for session time.`);

            // Award free credits for every 500 points
            const creditsEarned = Math.floor(user.points / 500);
            if (creditsEarned > 0) {
                user.freeCredit = (user.freeCredit || 0) + creditsEarned;
                user.points = user.points % 500; // Optional: deduct used points
                console.log(`✅ User ${user._id} earned ${creditsEarned} free credits.`);
            }

            await user.save(); // ✅ Save all at once
        } else {
            // Save total session time if needed
            await user.save();
        }
    }
}, 60 * 1000); // Runs every 1 minute
