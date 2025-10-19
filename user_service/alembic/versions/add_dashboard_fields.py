"""add dashboard fields

Revision ID: 3f4g5h6i7j8k
Revises: 2a3b4c5d6e7f
Create Date: 2025-10-19 09:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3f4g5h6i7j8k'
down_revision: Union[str, None] = '2a3b4c5d6e7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add dashboard fields
    op.add_column('users', sa.Column('job_title', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('company', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('skills', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('work_experience', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('education', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('portfolio_items', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('achievements', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('endorsements', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('social_links', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('custom_widgets', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('profile_views', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('followers_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('following_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('status_message', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('status_expiry', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove dashboard fields
    op.drop_column('users', 'status_expiry')
    op.drop_column('users', 'status_message')
    op.drop_column('users', 'following_count')
    op.drop_column('users', 'followers_count')
    op.drop_column('users', 'profile_views')
    op.drop_column('users', 'custom_widgets')
    op.drop_column('users', 'social_links')
    op.drop_column('users', 'endorsements')
    op.drop_column('users', 'achievements')
    op.drop_column('users', 'portfolio_items')
    op.drop_column('users', 'education')
    op.drop_column('users', 'work_experience')
    op.drop_column('users', 'skills')
    op.drop_column('users', 'company')
    op.drop_column('users', 'job_title')
