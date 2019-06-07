"""empty message

Revision ID: 276a0c34845a
Revises: 891a739c7fa0
Create Date: 2019-06-07 20:49:47.017842

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '276a0c34845a'
down_revision = '891a739c7fa0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('project', sa.Column('progress', sa.String(length=16), nullable=True))
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=False)
    op.drop_column('project', 'progress')
    # ### end Alembic commands ###
