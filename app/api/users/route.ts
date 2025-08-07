import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await authService.validateSession(sessionId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await authService.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await authService.validateSession(sessionId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userData = await request.json();
    const newUser = await authService.createUser(userData);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await authService.validateSession(sessionId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, ...updates } = await request.json();
    const updatedUser = await authService.updateUser(id, updates);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await authService.validateSession(sessionId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    const deleted = await authService.deleteUser(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
