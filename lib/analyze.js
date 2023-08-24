function i2rc(index) {
    return [index / 9 | 0, index % 9];
}

function rc2i(row, col) {
    return row * 9 + col;
}

export function d2b(digit) {
    return 1 << (digit - 1);
}

function b2d(byte) {
    for (var i = 0; byte; byte >>= 1, i++);
    return i;
}

function b2ds(byte) {
    let digits = [];
    for (let i = 1; byte; byte >>= 1, i++)
        if (byte & 1) digits.push(i);
    return digits;
}
function getMoves(board, row, col) {
    let r1 = 3 * (row / 3 | 0);
    let c1 = 3 * (col / 3 | 0);
    let moves = 0;
    for (let r = r1, i = 0; r < r1 + 3; r++) {
        for (let c = c1; c < c1 + 3; c++, i++) {
            moves |= board[r][c]
                | board[row][i]
                | board[i][col];
        }
    }
    return moves ^ 511;
}

function unique(allowed, row, col, value) {
    // let { row, col } = i2rc(index);
    let r1 = 3 * (row / 3 | 0);
    let c1 = 3 * (col / 3 | 0);
    let uniq_row = true, uniq_col = true, uniq_3x3 = true;
    for (let r = r1; r < r1 + 3; r++) {
        for (let c = c1; c < c1 + 3; c++) {
            if (!(r === row && c === col) && allowed[r][c] & value) {
                uniq_3x3 = false
                break
            }
        }
    }
    for (let r = 0; r < 9; r++) {
        if (r !== row && allowed[r][col] & value) {
            uniq_col = false
            break
        }
    }
    for (let c = 0; c < 9; c++) {
        if (c !== col && allowed[row][c] & value) {
            uniq_row = false
            break
        }
    }
    return (uniq_3x3 || uniq_row || uniq_col);
}

function analyze(board) {
    // let allowed = board.map((x, i) => x ? 0 : getMoves(board, i));
    let allowed = board.map((r, row) => r.map((x, col) => x ? 0 : getMoves(board, row, col)));
    let bestRowIndex, bestColIndex, bestLen = 100;
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (!board[row][col]) {
                let moves = allowed[row][col];
                let len = 0;
                for (let m = 1; moves; m <<= 1) if (moves & m) {
                    ++len;
                    if (unique(allowed, row, col, m)) {
                        allowed[row][col] = m;
                        len = 1;
                        break;
                    }
                    moves ^= m;
                }
                if (len < bestLen) {
                    bestLen = len;
                    bestRowIndex = row;
                    bestColIndex = col;
                    if (!bestLen) break;
                }
            }
        }
    }
    return {
        bestRowIndex,
        bestColIndex,
        len: bestLen,
        allowed: allowed.map(r => r.map(e => b2ds(e)))
    };
}

export default analyze