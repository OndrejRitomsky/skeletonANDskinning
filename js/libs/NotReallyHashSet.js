function HashSet() {
    this.set = [];
}

HashSet.prototype.add = function (value) {
    if (!this.contains(value)) {
        this.set.push(value);
    }
};

HashSet.prototype.remove = function (value) {
    var position = -1;
    for (var i = 0; i < this.set.length; i++) {
        if (value === this.set[i]) {
            position = i;
            break;
        }
    }
    if (position != -1) {
        var left = [];
        var right = [];
        for (var i = 0; i < this.set.length; i++) {
            if (i < position) {
                left.push(this.set[i]);
            } else if (i > position) {
                right.push(this.set[i]);
            }
        }
        this.clear();
        this.set = left.concat(right);
    }
};

HashSet.prototype.clear = function () {
    this.set.length = 0;
};

HashSet.prototype.contains = function (value) {
    for (var i = 0; i < this.set.length; i++) {
        if (value === this.set[i]) {
            return true;
        }
    }
    return false;
};

HashSet.prototype.isEmpty = function () {
    return (this.set.length == 0);
};

HashSet.prototype.fill = function (array) {
    for (var i = 0; i < array.length; i++) {
        this.add(array[i]);
    }
};

HashSet.prototype.keyArray = function () {
    var res = [];
    for (var i = 0; i < this.set.length; i++) {
        res.push(this.set[i]);
    }
    return res;
};