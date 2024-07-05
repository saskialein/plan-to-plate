"""Add categories as array to Recipe

Revision ID: 9ba9d34fae3b
Revises: 057422993c16
Create Date: 2024-07-05 01:47:58.238258

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9ba9d34fae3b'
down_revision = '057422993c16'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_cmetadata_gin', table_name='langchain_pg_embedding', postgresql_using='gin')
    op.drop_index('ix_langchain_pg_embedding_id', table_name='langchain_pg_embedding')
    op.drop_table('langchain_pg_embedding')
    op.drop_index('ix_key_namespace', table_name='upsertion_record')
    op.drop_index('ix_upsertion_record_group_id', table_name='upsertion_record')
    op.drop_index('ix_upsertion_record_key', table_name='upsertion_record')
    op.drop_index('ix_upsertion_record_namespace', table_name='upsertion_record')
    op.drop_index('ix_upsertion_record_updated_at', table_name='upsertion_record')
    op.drop_index('ix_upsertion_record_uuid', table_name='upsertion_record')
    op.drop_table('upsertion_record')
    op.drop_table('langchain_pg_collection')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('langchain_pg_collection',
    sa.Column('uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('cmetadata', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('uuid', name='langchain_pg_collection_pkey'),
    sa.UniqueConstraint('name', name='langchain_pg_collection_name_key'),
    postgresql_ignore_search_path=False
    )
    op.create_table('upsertion_record',
    sa.Column('uuid', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('key', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('namespace', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('group_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('updated_at', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('uuid', name='upsertion_record_pkey'),
    sa.UniqueConstraint('key', 'namespace', name='uix_key_namespace')
    )
    op.create_index('ix_upsertion_record_uuid', 'upsertion_record', ['uuid'], unique=False)
    op.create_index('ix_upsertion_record_updated_at', 'upsertion_record', ['updated_at'], unique=False)
    op.create_index('ix_upsertion_record_namespace', 'upsertion_record', ['namespace'], unique=False)
    op.create_index('ix_upsertion_record_key', 'upsertion_record', ['key'], unique=False)
    op.create_index('ix_upsertion_record_group_id', 'upsertion_record', ['group_id'], unique=False)
    op.create_index('ix_key_namespace', 'upsertion_record', ['key', 'namespace'], unique=False)
    op.create_table('langchain_pg_embedding',
    sa.Column('id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('collection_id', sa.UUID(), autoincrement=False, nullable=True),
    sa.Column('embedding', sa.NullType(), autoincrement=False, nullable=True),
    sa.Column('document', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('cmetadata', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['collection_id'], ['langchain_pg_collection.uuid'], name='langchain_pg_embedding_collection_id_fkey', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name='langchain_pg_embedding_pkey')
    )
    op.create_index('ix_langchain_pg_embedding_id', 'langchain_pg_embedding', ['id'], unique=True)
    op.create_index('ix_cmetadata_gin', 'langchain_pg_embedding', ['cmetadata'], unique=False, postgresql_using='gin')
    # ### end Alembic commands ###
