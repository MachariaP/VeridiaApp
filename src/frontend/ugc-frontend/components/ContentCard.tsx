'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ContentCard({ id, ...props }: { id: number }) {
	const wsRef = useRef<WebSocket | null>(null);
	const { isAuthenticated } = useAuth();
	const commentsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isAuthenticated) {
			wsRef.current = new WebSocket(`ws://localhost/ws/${id}`);
			wsRef.current.onmessage = (event) => {
				const newComment = event.data;
				const commentEl = document.createElement('p');
				commentEl.textContent = newComment;
				commentsRef.current?.appendChild(commentEl);
			};
		}
		return () => wsRef.current?.close();
	}, [id, isAuthenticated]);

	const sendComment = (text: string) => {
		if (wsRef.current) {
			wsRef.current.send(JSON.stringify({ text, content_id: id }));
		}
	};

	return (
		<div>
			{/* ...existing JSX... */}
			<div ref={commentsRef} className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
				<input
					type="text"
					onKeyDown={(e) => e.key === 'Enter' && sendComment(e.currentTarget.value)}
					placeholder="Add a comment..."
					className="input-field w-full"
				/>
			</div>
		</div>
	);
}
