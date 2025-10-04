const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1hr"});
}

// Register User
exports.registerUser = async (req,res) => {

    const {fullName, email, password, profileImageUrl} = req.body;

    if(!fullName || !email || !password)
        return res.status(400).json({message: "All fields are required"});

    try{
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message: "Email adready in use"});
    }

    const user = await User.create({
        fullName,
        email,
        password,
        profileImageUrl,
    });

    res.status(201).json({
        id: user._id,
        user,
        token: generateToken(user._id),
    });
} catch (error) {
    res.status(500).json({message: "Error registering user", error: error.message});
}
};

// Update Profile (fullName)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ message: "Full name is required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { fullName } },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile updated", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new password are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        user.password = newPassword;
        await user.save();
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error changing password", error: error.message });
    }
};
// Upload Profile Image
exports.uploadProfileImage = async (req, res) => {
    try {
        const { secure_url } = req.body;
        if (!secure_url) {
            return res.status(400).json({
                success: false,
                message: 'No image URL provided.'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user's profile image URL
        user.profileImageUrl = secure_url;
        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            user: {
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                profileImageUrl: updatedUser.profileImageUrl
            }
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading profile image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error logging in user", 
            error: error.message 
        });
    }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        res.status(200).json({ 
            success: true,
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error getting user information", 
            error: error.message 
        });
    }
};
