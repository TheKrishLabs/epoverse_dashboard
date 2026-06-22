
import { NextResponse } from 'next/server';
import { POSTS } from '@/lib/mock-db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await new Promise(resolve => setTimeout(resolve, 800));
  const { id } = await params;
  const post = POSTS.find(p => p.id === id);
  
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  
  return NextResponse.json(post);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await new Promise(resolve => setTimeout(resolve, 800));
  const { id } = await params;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateData: any = {};
  const contentType = request.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    updateData = Object.fromEntries(formData.entries());
    
    // Handle specific types (e.g., checkbox booleans)
    if (updateData.isLatest) updateData.isLatest = updateData.isLatest === 'true';
    if (updateData.tags) {
        // If tags were appended multiple times, entries() only gets the last one. 
        // We'd need getAll() if we care about arrays in the mock.
        updateData.tags = formData.getAll('tags');
    }
  } else {
    updateData = await request.json();
  }

  const index = POSTS.findIndex(p => p.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  
  POSTS[index] = { ...POSTS[index], ...updateData };
  return NextResponse.json(POSTS[index]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await new Promise(resolve => setTimeout(resolve, 800));
  const { id } = await params;
  const index = POSTS.findIndex(p => p.id === id);
  
  if (index !== -1) {
    POSTS.splice(index, 1);
  }
  
  return NextResponse.json({ success: true });
}
