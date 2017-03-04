package bundled

func Asset(basename string) string {
	return string(assets["assets/"+basename])
}
