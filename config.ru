use Rack::Static,
  :urls => [ "/js", "/css" ],
  :root => "demo"

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('demo/index.html', File::RDONLY)
  ]
}