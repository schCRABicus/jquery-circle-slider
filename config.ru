use Rack::Static,
  :urls => ["/demo/js", "/demo/css", "/src" ],
  :root => "."

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('/demo/prindex.html', File::RDONLY)
  ]
}