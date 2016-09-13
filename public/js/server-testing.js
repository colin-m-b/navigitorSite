//import $ from 'jquery'

$('document').on('ready', function (){
    console.log('firing')
let obj = {}
obj.username = 'Colin'
obj.email = 'colin@colin.com'
obj.password = 'test'
obj.team = 'testteam'
obj.github = 'colin-m-b'

$.ajax({
    data: obj,
    url: 'http://localhost:3000/verify',
    method: 'POST',
    success: (data) => {
        console.log('success with data: ' + data)
    }
})
})

// user: req.body.username,
// email: req.body.email,
// password: req.body.password,
// team: req.body.team,
// github: req.body.github