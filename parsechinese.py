from chinese import ChineseAnalyzer
from pypinyin import pinyin, Style

analyzer = ChineseAnalyzer()


def add_ruby_tags(text: str) -> str:
    """
    Convert Chinese text to HTML with <ruby> and <rt> tags using ChineseAnalyzer.
    
    Args:
        text (str): Chinese text.
        
    Returns:
        str: HTML string with ruby annotations for pinyin.
    """
    result = analyzer.parse(text)
    words = []

    for key in result.tokens():
        word = []
        token = result[key]
        original = key  # not token[0].match
        pinyins = token[0].pinyin

        if pinyins is None:
            # fallback: get pinyin character by character using pypinyin
            pinyins = [p[0] for p in pinyin(original, style=Style.TONE)]

        char_pinyin_pairs = list(zip(original, pinyins))

        for char, py in char_pinyin_pairs:
            # Convert numbered pinyin to tone marks
            py_with_tone = number_to_tone(py)
            word.append(f"<ruby>{char}<rt>{py_with_tone}</rt></ruby>")
        words.append(''.join(word))

    return ' '.join(words)


def number_to_tone(pinyin: str) -> str:
    """
    Converts numbered pinyin (e.g., 'hao3') to pinyin with tone marks (e.g., 'hǎo').
    """
    tone_map = {
        'a': ['ā', 'á', 'ǎ', 'à'],
        'e': ['ē', 'é', 'ě', 'è'],
        'i': ['ī', 'í', 'ǐ', 'ì'],
        'o': ['ō', 'ó', 'ǒ', 'ò'],
        'u': ['ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    }

    import re
    match = re.match(r"([a-zü]+)([1-5])", pinyin, re.IGNORECASE)
    if not match:
        return pinyin  # fallback if format unexpected
    syllable, tone = match.groups()
    tone = int(tone)
    if tone == 5:
        return syllable  # neutral tone
    # Put tone mark on the correct vowel according to pinyin rules
    for vowel in 'a e o i u ü'.split():
        if vowel in syllable:
            return syllable.replace(vowel, tone_map[vowel][tone - 1], 1)
    # fallback if no standard vowel found
    return syllable


def demo():
    raw = "日本城堡"
    result = analyzer.parse(raw)
    print([i for i in result.tokens()])
    print([result[i][0].match for i in result.tokens()])
    print([result[i][0].pinyin for i in result.tokens()])
    print(result.pinyin(force=True))
    print(add_ruby_tags(raw))


if False:
    demo()
else:
    for line in open("chinese.txt", "r", encoding="utf-8"):
        line = line.strip()
        if not line:
            continue
        print(add_ruby_tags(line))
