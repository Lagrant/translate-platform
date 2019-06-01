import pandas as pd
import numpy as np
from sklearn import preprocessing
from sklearn.cluster import KMeans
global labels
table_data, table_features, table_identifiers = read_table_data('examples/table/car.csv')
data = np.array(table_data)
data = preprocessing.MinMaxScaler().fit_transform(data)
model = KMeans(n_clusters=6)
clustering = model.fit(data)
labels = clustering.labels_
labels = labels.tolist()