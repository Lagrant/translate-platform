"""empty message

Revision ID: 439d940a63cc
Revises: 2f3e58571ec6
Create Date: 2019-06-06 22:47:56.590664

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '439d940a63cc'
down_revision = '2f3e58571ec6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('translators_projects')
    op.add_column('translators_tasks', sa.Column('task_type', sa.String(length=32), nullable=False))
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=False)
    op.drop_column('translators_tasks', 'task_type')
    op.create_table('translators_projects',
    sa.Column('translator_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=False),
    sa.Column('task_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['task.id'], name='translators_projects_ibfk_2'),
    sa.ForeignKeyConstraint(['translator_id'], ['user.id'], name='translators_projects_ibfk_1'),
    sa.PrimaryKeyConstraint('translator_id', 'task_id'),
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    # ### end Alembic commands ###
