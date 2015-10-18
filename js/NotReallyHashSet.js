/**
 * Created by Mato on 10/18/2015.
 */
var HashSet = function () {
    this.set = [];
};

HashSet.prototype.add = function (key) {
    if(!this.contains(key)){
        this.set.push(key);
    }
};

HashSet.prototype.remove = function (key) {
    var pos = -1;
    for(var i = 0; i < this.set.length; i++){
        if(key === this.set[i]) {
            pos = i;
            break;
        }
    }
    if(pos != -1){
        var x = [];
        var y = [];
        for(var i = 0; i < this.set.length; i++){
            if(i < pos) {
                x.push(this.set[i]);
            } else if(i > pos){
                y.push(this.set[i]);
            }
        }
        this.clear();
        this.set = x.concat(y);
    }
};

HashSet.prototype.clear = function () {
    this.set.length = 0;
};

HashSet.prototype.contains = function (key) {
    for(var i = 0; i < this.set.length; i++){
        if(key === this.set[i]) {
            return true;
        }
    }
    return false;
};

HashSet.prototype.isEmpty = function () {
    return (this.set.length == 0);
};

HashSet.prototype.fill = function (array) {
    for(var i = 0; i < array.length; i++) {
        this.add(array[i]);
    }
};

HashSet.prototype.keyArray = function () {
    var res = [];
    for(var i = 0; i < this.set.length; i++) {
        res.push(this.set[i]);
    }
    return res;
};