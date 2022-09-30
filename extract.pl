while (<>) {
  if (/\[1\]:\s*([A-Ia-i]+)/) {
      if (length($1) > 6) {
          print "$1\n";
      }
  }
}
