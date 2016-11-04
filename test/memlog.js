var statistics = require('statistics')

var tape = require('tape')

var Flume = require('../')

var MemLog = require('flumelog-memory')
var Reduce = require('flumeview-reduce')

module.exports = function (db) {
  db.use('stats', Reduce(function (acc, data) {
    return statistics(acc, data.foo)
  }))

  tape('simple', function (t) {

    db.since(function (v) { 
      console.log("SINCE", v)
    }, false)

    db.append({foo: 1}, function (err, seq) {
      if(err) throw err
      console.log("GET", err, seq, db.stats)
      db.stats.get([], function (err, value) {
        if(err) throw err
        console.log(  "GET", value)
        t.deepEqual(value.mean, 1)
        t.deepEqual(value.stdev, 0)
        t.end()
      })
    })
  })

  tape('append', function (t) {
    db.append({foo: 3}, function (err, seq) {
      if(err) throw err
      console.log("GET", err, seq)
      db.stats.get([], function (err, value) {
        if(err) throw err
        console.log(  "GET", value)
        t.deepEqual(value.mean, 2)
        t.deepEqual(value.stdev, 1)
        t.end()
      })
    })
  })

}

if(!module.parent)
  module.exports(Flume(MemLog()))



