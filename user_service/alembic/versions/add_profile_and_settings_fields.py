"""add profile and settings fields

Revision ID: 2a3b4c5d6e7f
Revises: dc67a5e5827a
Create Date: 2025-10-18 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2a3b4c5d6e7f'
down_revision: Union[str, None] = 'dc67a5e5827a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add profile fields
    op.add_column('users', sa.Column('bio', sa.String(length=160), nullable=True))
    op.add_column('users', sa.Column('avatar', sa.String(length=512), nullable=True))
    op.add_column('users', sa.Column('cover_photo', sa.String(length=512), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('website', sa.String(length=255), nullable=True))
    
    # Add settings fields
    op.add_column('users', sa.Column('notifications_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('theme', sa.String(length=20), nullable=False, server_default='light'))
    op.add_column('users', sa.Column('language', sa.String(length=10), nullable=False, server_default='en'))
    op.add_column('users', sa.Column('privacy_posts', sa.String(length=20), nullable=False, server_default='public'))
    op.add_column('users', sa.Column('privacy_profile', sa.String(length=20), nullable=False, server_default='public'))


def downgrade() -> None:
    # Remove settings fields
    op.drop_column('users', 'privacy_profile')
    op.drop_column('users', 'privacy_posts')
    op.drop_column('users', 'language')
    op.drop_column('users', 'theme')
    op.drop_column('users', 'notifications_enabled')
    
    # Remove profile fields
    op.drop_column('users', 'website')
    op.drop_column('users', 'location')
    op.drop_column('users', 'cover_photo')
    op.drop_column('users', 'avatar')
    op.drop_column('users', 'bio')
