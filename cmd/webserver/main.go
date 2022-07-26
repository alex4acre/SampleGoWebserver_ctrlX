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

	//Create a folder/directory at a full qualified path for the website
	if _, err := os.Stat("/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www/DO_NOT_DELETE"); err == nil {
		//do nothing, the file exists
	 } else {
		err := os.MkdirAll("/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www", os.ModePerm)
		if err != nil {
			log.Fatal(err)
		}
		//clear the directory and copy over the new file content
		os.RemoveAll("/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www")
		originalPage := filepath.FromSlash(filepath.Join(os.Getenv("SNAP"), "www"))
		Dir(originalPage, "/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www",)
	 }		

	www := ""
	snapped := false
	// change commonpath if app is not running as a snap
	_, snapped = os.LookupEnv("SNAP"); 

	www = "/var/snap/rexroth-solutions/common/solutions/activeConfiguration/Webserver/www";
	// Create http handle
	http.Handle("/your-webserver/", http.StripPrefix("/your-webserver/", http.FileServer(http.Dir(www))))

	// Differentiate between app is snapped (-> unix sockets) and app is running external (-> tcp)
	if snapped {

		//sockpath := filepath.Join(os.Getenv("SNAP_DATA"), "/package-run/rexroth-hello-webserver/")
		sockpath := filepath.Join(os.Getenv("SNAP_DATA"), "/package-run/your-webserver/")
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
