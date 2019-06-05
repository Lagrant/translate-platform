"""empty message

Revision ID: 57809dda6d55
Revises: 
Create Date: 2019-06-02 00:12:57.058897

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '57809dda6d55'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(None, 'project', ['name'])
    op.add_column('task', sa.Column('end_page', sa.Integer(), nullable=True))
    op.add_column('task', sa.Column('start_page', sa.Integer(), nullable=True))
    op.add_column('task', sa.Column('task_path', sa.String(length=256), nullable=True))
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=True)
    op.create_unique_constraint(None, 'user', ['email'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'user', type_='unique')
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=False)
    op.drop_column('task', 'task_path')
    op.drop_column('task', 'start_page')
    op.drop_column('task', 'end_page')
    op.drop_constraint(None, 'project', type_='unique')
    # ### end Alembic commands ###
