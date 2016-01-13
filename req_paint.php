<?php
session_start();
if(!isset($_SESSION['email'])) 
{
    header("Location: main.php");
}
$drawingCommands=stripslashes($_POST['drawingCommands']);
$picture=stripslashes($_POST['picture']);
$userId = $_SESSION['sid'];
try 
{
    $dbh = new PDO('mysql:host=localhost;dbname=pictionnary', 'test', 'test');

    $sql = $dbh->prepare("INSERT INTO drawings(drawingCommands, picture, userId) VALUES (:drawingCommands, :picture, :userId);");
	$sql->bindValue(':drawingCommands', $drawingCommands);
	$sql->bindValue(':picture', $picture);
	$sql->bindValue(':userId', $userId);
	if (!$sql->execute()) 
	{
		echo "PDO::errorInfo():<br/>";
		$err = $sql->errorInfo();
		print_r($err);
	} 
	else 
	{
		header('Location: main.php');
	}
	$dbh = null;
} 
catch (PDOException $e) 
{
    print "Erreur !: " . $e->getMessage() . "<br/>";
    $dbh = null;
    die();
}
?>