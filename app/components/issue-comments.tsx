import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Comment } from '../types/issue'

type CommentsProps = {
  comments: Comment[]
  onAddComment: (content: string) => void
}

export function IssueComments({ comments, onAddComment }: CommentsProps) {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment('')
    }
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <ul className="space-y-2">
        {comments.map((comment) => (
          <li key={comment.id} className="bg-gray-100 p-2 rounded">
            <p className="font-semibold">{comment.author}</p>
            <p>{comment.content}</p>
            <p className="text-sm text-gray-500">{comment.createdAt}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow"
        />
        <Button type="submit">Add Comment</Button>
      </form>
    </div>
  )
}

