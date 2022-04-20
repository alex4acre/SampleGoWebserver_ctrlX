package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"path"
	"io/ioutil"
	"io"
)

func main() {

	/*create a simple file path on the controller*/
	//Create a folder/directory at a full qualified path
    err := os.MkdirAll("/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www", os.ModePerm)
    if err != nil {
        log.Fatal(err)
    }
	
	/*err = os.Mkdir("/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www", 0777)
    if err != nil {
        log.Fatal(err)
    }*/

	file, err := os.Create("/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www/test.txt")
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()
    linesToWrite := []string{"This is an example", "to show how", "to write to a file", "line by line."}
    for _, line := range linesToWrite {
        file.WriteString(line + "\n")
    }

	www := ""
	snapped := false
	// change commonpath if app is not running as a snap
	if _, snapped = os.LookupEnv("SNAP"); !snapped {
		fmt.Printf("App is running as external Application (Debug)")
		dir, _ := os.Getwd()
		www = filepath.FromSlash(filepath.Join(filepath.Dir(dir), "www"))
	} else {
		fmt.Printf("App is running as snap inside ctrlX")
		www = filepath.FromSlash(filepath.Join(os.Getenv("SNAP"), "www"))
	}

	// Check if directory exist
	fmt.Printf("Check if serve path exist: %s \n", www)
	if _, err := os.Stat(www); os.IsNotExist(err) {
		// If directory not exist, cancel operation because nothing to serve
		fmt.Printf("Serve path does not exist \n")
		log.Fatalf("Nothing to serve")
	} else {
		fmt.Printf("Common-Path exist \n")
	}

	Dir(www, "var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www")
	
	// Create http handle
	//http.Handle("/hello-webserver/", http.StripPrefix("/hello-webserver/", http.FileServer(http.Dir(www))))
	http.Handle("/your-webserver/", http.StripPrefix("/your-webserver/", http.FileServer(http.Dir(www))))

	// Differentiate between app is snapped (-> unix sockets) and app is running external (-> tcp)
	if snapped {

		sockpath := filepath.Join(os.Getenv("SNAP_DATA"), "/package-run/rexroth-hello-webserver/")
		sockfile := filepath.Join(sockpath, "web.sock")
		if _, err := os.Stat(sockpath); os.IsNotExist(err) {
			os.MkdirAll(sockpath, os.ModePerm)

		}
		os.Remove(sockfile)

		unixListener, err := net.Listen("unix", sockfile)
		if err != nil {
			panic(err)
		}

		fmt.Printf("Server UP - UNIX SOCKET - File: %s ", sockfile)
		http.Serve(unixListener, nil)

	} else {
		port := "1234"

		tcpListener, err := net.Listen("tcp", ":"+port)
		if err != nil {
			panic(err)
		}

		fmt.Printf("Server UP - TCP - Port: %s ", port)
		http.Serve(tcpListener, nil)
	}

}

// Dir copies a whole directory recursively
func Dir(src string, dst string) error {
	var err error
	var fds []os.FileInfo
	var srcinfo os.FileInfo

	if srcinfo, err = os.Stat(src); err != nil {
		return err
	}

	if err = os.MkdirAll(dst, srcinfo.Mode()); err != nil {
		return err
	}

	if fds, err = ioutil.ReadDir(src); err != nil {
		return err
	}
	for _, fd := range fds {
		srcfp := path.Join(src, fd.Name())
		dstfp := path.Join(dst, fd.Name())

		if fd.IsDir() {
			if err = Dir(srcfp, dstfp); err != nil {
				fmt.Println(err)
			}
		} else {
			if err = File(srcfp, dstfp); err != nil {
				fmt.Println(err)
			}
		}
	}
	return nil
}

// File copies a single file from src to dst
func File(src, dst string) error {
	var err error
	var srcfd *os.File
	var dstfd *os.File
	var srcinfo os.FileInfo

	if srcfd, err = os.Open(src); err != nil {
		return err
	}
	defer srcfd.Close()

	if dstfd, err = os.Create(dst); err != nil {
		return err
	}
	defer dstfd.Close()

	if _, err = io.Copy(dstfd, srcfd); err != nil {
		return err
	}
	if srcinfo, err = os.Stat(src); err != nil {
		return err
	}
	return os.Chmod(dst, srcinfo.Mode())
}
