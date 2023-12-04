# Doing it quickly on my lunchtime, cheating with Python
import math
import re

with open('input') as f:
    lines = f.readlines()

def evaluate1(line):
    m = re.search(r'Card +\d+:(.*)\|(.*)$', line)
    if not m:
        return 0
    winning = m.group(1).strip().split(' ')
    card = m.group(2).strip().split(' ')
    count = sum(1 for n in card if n != '' and n in winning)
    if count == 0:
        return 0
    score = math.pow(2, count - 1)
    return score


def evaluate(line):
    m = re.search(r'Card +\d+:(.*)\|(.*)$', line)
    if not m:
        return 0
    winning = m.group(1).strip().split(' ')
    card = m.group(2).strip().split(' ')
    return sum(1 for n in card if n != '' and n in winning)

idx = 0
def score(nb_cards, current):
    k
    idx += 1
    return nb_cards



scores = [evaluate(l) for l in lines]
nb_cards = [1 for l in lines if l != '']
print(len(nb_cards))

for index, score in enumerate(scores):
    print(f'Card {index}, qty {nb_cards[index]}, score {score}')
    for i in range(index + 1, index + score + 1):
        nb_cards[i] += nb_cards[index]

print(len(nb_cards))
print(sum(nb_cards)) # Off by 1 error

