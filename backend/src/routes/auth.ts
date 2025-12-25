import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { RegisterRequest, LoginRequest, AuthResponse, ApiResponse, User as UserType } from '../../../shared/types';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      } as ApiResponse<never>);
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      } as ApiResponse<never>);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      } as ApiResponse<never>);
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Registration error:', error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to register user'
    };
    res.status(500).json(errorResponse);
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse<never>);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse<never>);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse<never>);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Login error:', error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to login'
    };
    res.status(500).json(errorResponse);
  }
});

// GET /api/auth/me - Get current user profile (requires auth)
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse<never>);
    }

    const response: ApiResponse<Omit<UserType, 'password'>> = {
      success: true,
      data: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Get profile error:', error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to get user profile'
    };
    res.status(500).json(errorResponse);
  }
});

// PUT /api/auth/profile - Update user profile (requires auth)
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse<never>);
    }

    const { name, email } = req.body;
    const updates: any = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (email && email.trim()) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email is already taken'
        } as ApiResponse<never>);
      }

      updates.email = email.toLowerCase().trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      } as ApiResponse<never>);
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updatedUser) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(errorResponse);
    }

    const response: ApiResponse<Omit<UserType, 'password'>> = {
      success: true,
      data: {
        _id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Update profile error:', error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to update profile'
    };
    res.status(500).json(errorResponse);
  }
});

export default router;
