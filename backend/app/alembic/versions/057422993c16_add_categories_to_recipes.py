"""Add categories to recipes

Revision ID: 057422993c16
Revises: 0f3c3f116823
Create Date: 2024-07-05 00:03:46.250502

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '057422993c16'
down_revision = '0f3c3f116823'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipe', sa.Column('categories', sa.ARRAY(sa.String()), nullable=True))
    op.drop_column('recipe', 'category')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipe', sa.Column('category', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_column('recipe', 'categories')
    # ### end Alembic commands ###
