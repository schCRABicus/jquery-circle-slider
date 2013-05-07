use Rack::Static,
  :urls => [ { "/" => "index.html" } , "/js", "/css" ],
  :root => "demo"

run Rack::Directory.new("public")