const User = require("../models/userModel"); // Assuming your user model is exported as User

class UserController {
    
    async addNewUser(userDetails){
        try {

            const user = new User({
                fullName: userDetails.fullName,
                rollNumber: userDetails.rollNumber,
                email: userDetails.email,
                profileInfo: {
                    bio: userDetails.profileInfo.bio,
                    profilePicture: {
                        url: userDetails.profileInfo.profilePicture.url,
                        filename: userDetails.profileInfo.profilePicture.filename
                    }
                },
                department: userDetails.department,
                type: userDetails.type,
                assignments: userDetails.assignments // Assuming assignments is an array of ObjectIds
            });
    

            await user.save();
            return user.fullName;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = UserController;