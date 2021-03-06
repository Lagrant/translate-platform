"""empty message

Revision ID: 891a739c7fa0
Revises: a1fa03b040ec
Create Date: 2019-06-07 10:12:29.406137

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '891a739c7fa0'
down_revision = 'a1fa03b040ec'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('translators_tasks', sa.Column('id', sa.Integer(), autoincrement=True, nullable=False))
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=False)
    op.drop_column('translators_tasks', 'id')
    # ### end Alembic commands ###
