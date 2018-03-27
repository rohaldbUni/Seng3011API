var fetch = require('isomorphic-fetch')
var express = require('express')
var moment = require('moment')
var router = express.Router()

const access_token = 'EAACEdEose0cBAEzPAxCF1Dq2kpb1SkIz74ZCf7mEJ640LcvUWd98UFrtV1ZBfQ5ZCXTgZCQdfgFpm11m1xZCiUafmkZCjP0mN3jKFubkv51AgAOuNCXvflWd8IGUAlWgutxH2T8vA9pOhiJf3INpsFZBgLJpV4Nnkrqgd4eoMNXZATt3j93l1C9TceCifZBaAs00ZD'

router.get('/', function (req, res, next) {
  // start timer
  const start_time = new Date()

  console.log(req.query)

  let { company, statistics } = req.query
  const start_date = moment(req.query.start_date)
  const end_date = moment(req.query.end_date)

  if (!start_date.isValid() || !end_date.isValid() || !company) {
    // the params are invalid, need to respond with invalid field
    res.json({status: 400, message: 'bad request'})
  } else {

    fetch(`https://graph.facebook.com/${company}?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`)
    .then(function (response) {
      if (response.ok) {
          response.json().then(data => {
          res.json(responseFormatter(req, response, start_time, data))
        })
      } else {
          fetch(`https://graph.facebook.com/v2.12/search?q=${company}&type=page&fields=name,fan_count&access_token=${access_token}`)
          .then(function (response) {
            if (response.ok) {
                response.json().then(data => {
                    // res.json(responseFormatter(req, response, data))
                    // var curBiggestFanCount = 0
                    // var curBiggestId = 0
                    // for (var key of data.data) {
                    //     if (parseInt(key.fan_count) > curBiggestFanCount) {
                    //         curBiggestFanCount = parseInt(key.fan_count);
                    //         curBiggestId = key.id;
                    //     }
                    // }
                    if (data.data[0]) {
                    // if (curBiggestId != 0) {
                        // var companyId = curBiggestId
                        // maybe organise by type = companies so video games, stadiums, retials dont appear etc
                        // var companyId = data.data[0].id;
                        var companyId = data.data[0].id
                        fetch(`https://graph.facebook.com/${companyId}?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`)
                            .then(function (response) {
                              if (response.ok) {
                                  response.json().then(data => {
                                  res.json(responseFormatter(req, response, start_time, data))
                                })
                            } else {
                                res.json(responseFormatter(req, response))
                            }
                        })
                    } else {
                        res.json(responseFormatter(req, response))
                    }
              })
            } else {
              res.json(responseFormatter(req, response))
            }
          }).catch(error => console.error(error))

            //res.json(responseFormatter(req, response, start_time))
      }
    })
    .catch(error => console.error(error))

  }

})
const responseFormatter = (req, api_response, start_time, api_data = null) => {
  const end_time = new Date()
  return {
    data: api_data,
    metadata: {
      dev_team: 'Team Unassigned',
      version: '1.0.0',
      start_time,
      end_time,
      time_elapsed: end_time - start_time,
      params: req.query,
      status: api_response.status,
      status_text: api_response.statusText
    }
  }
}

module.exports = router
