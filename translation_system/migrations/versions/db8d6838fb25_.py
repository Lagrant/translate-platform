"""empty message

Revision ID: db8d6838fb25
Revises: 8a236bc6fd94
Create Date: 2019-06-05 10:46:39.716230

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'db8d6838fb25'
down_revision = '8a236bc6fd94'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('book', sa.Column('translated_book_name', sa.String(length=256), nullable=True))
    op.add_column('book', sa.Column('translated_page_number', sa.Integer(), nullable=True))
    op.create_unique_constraint(None, 'book', ['translated_book_name'])
    op.create_unique_constraint(None, 'book', ['book_name'])
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('user', 'email',
               existing_type=mysql.VARCHAR(length=128),
               nullable=False)
    op.drop_constraint(None, 'book', type_='unique')
    op.drop_constraint(None, 'book', type_='unique')
    op.drop_column('book', 'translated_page_number')
    op.drop_column('book', 'translated_book_name')
    # ### end Alembic commands ###
