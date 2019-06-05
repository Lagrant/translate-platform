import .ahocorasick

chinese_index = {}
japanese_index = {}
english_string = []
text = ""

with open("../wording-cn-jp.csv", "r") as f:
    line = f.readline()

    while line:
        words = line.split(",")
        english_string.append(words[0])
        chinese_index[words[0]] = words[1]
        japanese_index[words[0]] = words[2]

        line = f.readline()

with open("../source.txt", "r") as f:
    text = f.read()

end_string = text[-1]
tree=ahocorasick.AhoCorasick(*english_string)
results = tree.search(text, True)

lr = []
while len(results) >0:
    lr.append(results.pop())
lr = sorted(lr, key=lambda x: x[1][0], reverse=True)
print(lr)

for i in range(0,len(lr)):
    english_index = lr[i][0]
    start_index = lr[i][1][0]
    end_index = lr[i][1][1]

    substring1 = text[0:start_index]
    substring2 = text[end_index:-1]
    text = substring1 + chinese_index[english_index] + substring2 + end_string

with open("../target.txt", "w") as f:
    f.write(text)